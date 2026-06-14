process.env.NODE_ENV = "test";
process.env.FIREBASE_DISABLED = "true";
process.env.ADMIN_EMAIL = "admin@velvetnights.in";
process.env.ADMIN_PASSWORD = "admin123";
process.env.JWT_SECRET = "test-jwt-secret";
process.env.JWT_EXPIRES_IN = "1h";
process.env.BOOKING_NOTIFICATION_WEBHOOK = "";

const test = require("node:test");
const assert = require("node:assert/strict");
const app = require("../server");
const memoryStore = require("../src/data/memoryStore");
const createRateLimiter = require("../src/middleware/rateLimiter");

let server;
let baseUrl;

const tomorrow = () => {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  return date.toISOString().slice(0, 10);
};

const today = () => new Date().toISOString().slice(0, 10);

const yesterday = () => {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  return date.toISOString().slice(0, 10);
};

const nextWeek = () => {
  const date = new Date();
  date.setDate(date.getDate() + 7);
  return date.toISOString().slice(0, 10);
};

const resetStore = () => {
  memoryStore.bookings.splice(0, memoryStore.bookings.length);
  memoryStore.blockedSlots.splice(0, memoryStore.blockedSlots.length);
  memoryStore.contactMessages.splice(0, memoryStore.contactMessages.length);
  createRateLimiter.clear();
};

const request = async (path, options = {}) => {
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(options.headers || {}),
    },
  });
  const contentType = response.headers.get("content-type") || "";
  const body = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  return { response, body };
};

const login = async () => {
  const { response, body } = await request("/api/admin/login", {
    method: "POST",
    body: JSON.stringify({
      email: "admin@velvetnights.in",
      password: "admin123",
    }),
  });

  assert.equal(response.status, 200);
  return body.data.token;
};

const createBooking = (overrides = {}) =>
  request("/api/bookings", {
    method: "POST",
    body: JSON.stringify({
      name: "Test User",
      phone: "9876543210",
      email: "test@example.com",
      eventType: "Private event",
      eventDate: tomorrow(),
      eventTime: "08:30 PM",
      packageId: "signature",
      guestCount: 2,
      location: "Chennai",
      addons: ["addon-cake"],
      notes: "Test booking",
      ...overrides,
    }),
  });

test.before(async () => {
  server = app.listen(0);
  await new Promise((resolve) => server.once("listening", resolve));
  const address = server.address();
  baseUrl = `http://127.0.0.1:${address.port}`;
});

test.after(async () => {
  await new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
});

test.beforeEach(() => {
  resetStore();
});

test("creates a valid booking", async () => {
  const { response, body } = await createBooking();

  assert.equal(response.status, 201);
  assert.equal(body.success, true);
  assert.equal(body.data.status, "pending");
  assert.equal(body.data.packageId, "signature");
});

test("rejects invalid booking input", async () => {
  const invalidPhone = await createBooking({ phone: "12345" });
  assert.equal(invalidPhone.response.status, 400);
  assert.match(invalidPhone.body.message, /phone/);

  const invalidEmail = await createBooking({ email: "bad-email" });
  assert.equal(invalidEmail.response.status, 400);
  assert.match(invalidEmail.body.message, /email/);

  const pastDate = await createBooking({ eventDate: "2020-01-01" });
  assert.equal(pastDate.response.status, 400);
  assert.match(pastDate.body.message, /future date/);

  const invalidGuests = await createBooking({ guestCount: 0 });
  assert.equal(invalidGuests.response.status, 400);
  assert.match(invalidGuests.body.message, /guestCount/);

  const invalidPackage = await createBooking({ packageId: "missing-package" });
  assert.equal(invalidPackage.response.status, 400);
  assert.match(invalidPackage.body.message, /packageId/);

  const invalidAddon = await createBooking({ addons: ["missing-addon"] });
  assert.equal(invalidAddon.response.status, 400);
  assert.match(invalidAddon.body.message, /add-ons/);
});

test("blocks duplicate pending or confirmed bookings for the same slot", async () => {
  const first = await createBooking();
  assert.equal(first.response.status, 201);

  const duplicate = await createBooking({ name: "Second User" });
  assert.equal(duplicate.response.status, 409);
  assert.match(duplicate.body.message, /already booked/);

  const differentTime = await createBooking({
    name: "Third User",
    eventTime: "07:00 PM",
  });
  assert.equal(differentTime.response.status, 201);
});

test("admin blocked slots show as booked and cannot be reserved", async () => {
  const token = await login();
  const eventDate = tomorrow();
  const eventTime = "08:30 PM";

  const blocked = await request("/api/admin/blocked-slots", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ eventDate, eventTime, reason: "Maintenance" }),
  });

  assert.equal(blocked.response.status, 201);

  const availability = await request(`/api/bookings/availability/slots?date=${eventDate}`);
  assert.equal(availability.response.status, 200);
  assert.equal(availability.body.data.bookedSlots.includes(eventTime), true);

  const booking = await createBooking({ eventDate, eventTime });
  assert.equal(booking.response.status, 409);
  assert.match(booking.body.message, /already booked/);
});

test("admin blocked dates show all default slots as booked", async () => {
  const token = await login();
  const eventDate = nextWeek();

  const blocked = await request("/api/admin/blocked-slots", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ eventDate }),
  });

  assert.equal(blocked.response.status, 201);

  const availability = await request(`/api/bookings/availability/slots?date=${eventDate}`);
  assert.equal(availability.response.status, 200);
  assert.equal(availability.body.data.blockedDate, true);
  assert.equal(availability.body.data.bookedSlots.length, 5);

  const booking = await createBooking({
    eventDate,
    eventTime: "10:00 AM - 11:30 AM",
  });
  assert.equal(booking.response.status, 409);
});

test("admin cannot block today or past dates", async () => {
  const token = await login();

  const todayBlock = await request("/api/admin/blocked-slots", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ eventDate: today() }),
  });
  assert.equal(todayBlock.response.status, 400);
  assert.match(todayBlock.body.message, /future date/);

  const pastBlock = await request("/api/admin/blocked-slots", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ eventDate: yesterday() }),
  });
  assert.equal(pastBlock.response.status, 400);
  assert.match(pastBlock.body.message, /future date/);
});

test("allows only one concurrent booking for the same slot", async () => {
  const attempts = await Promise.all([
    createBooking({ name: "Fast User One" }),
    createBooking({ name: "Fast User Two" }),
  ]);

  const statuses = attempts.map(({ response }) => response.status).sort();
  assert.deepEqual(statuses, [201, 409]);
  assert.equal(memoryStore.bookings.length, 1);
});

test("requires admin JWT for protected admin routes", async () => {
  const unauthorized = await request("/api/admin/bookings");
  assert.equal(unauthorized.response.status, 401);

  const token = await login();
  const authorized = await request("/api/admin/bookings", {
    headers: { Authorization: `Bearer ${token}` },
  });

  assert.equal(authorized.response.status, 200);
  assert.equal(authorized.body.success, true);
});

test("updates booking details with PATCH /api/bookings/:id", async () => {
  const token = await login();
  const created = await createBooking();
  const bookingId = created.body.data.id;

  const updated = await request(`/api/bookings/${bookingId}`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      eventDate: nextWeek(),
      eventTime: "07:00 PM",
      guestCount: 4,
      packageId: "birthday",
      addons: ["addon-photography"],
      notes: "Updated notes",
      location: "Bangalore",
    }),
  });

  assert.equal(updated.response.status, 200);
  assert.equal(updated.body.data.eventTime, "07:00 PM");
  assert.equal(updated.body.data.guestCount, 4);
  assert.equal(updated.body.data.packageId, "birthday");
  assert.deepEqual(updated.body.data.addons, ["addon-photography"]);
});

test("updates booking status through protected status route", async () => {
  const token = await login();
  const created = await createBooking();
  const bookingId = created.body.data.id;

  const updated = await request(`/api/bookings/${bookingId}/status`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ status: "confirmed" }),
  });

  assert.equal(updated.response.status, 200);
  assert.equal(updated.body.data.status, "confirmed");
});

test("rate limits admin login attempts", async () => {
  for (let index = 0; index < 5; index += 1) {
    const attempt = await request("/api/admin/login", {
      method: "POST",
      body: JSON.stringify({
        email: "wrong@example.com",
        password: "wrong",
      }),
    });
    assert.equal(attempt.response.status, 401);
  }

  const limited = await request("/api/admin/login", {
    method: "POST",
    body: JSON.stringify({
      email: "wrong@example.com",
      password: "wrong",
    }),
  });

  assert.equal(limited.response.status, 429);
});
