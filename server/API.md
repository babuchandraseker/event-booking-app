# Backend API

Base URL:

```text
http://localhost:5000/api
```

## Create Booking

```http
POST /bookings
Content-Type: application/json
```

```json
{
  "name": "Vishwa",
  "phone": "1234567891",
  "email": "vishwa@example.com",
  "eventType": "Birthday",
  "eventDate": "2026-05-04",
  "eventTime": "05:30 PM",
  "packageId": "signature",
  "guestCount": 2,
  "location": "Bangalore",
  "addons": [],
  "notes": "Need decoration"
}
```

New bookings are saved in Firestore and logged in the backend terminal.
If `BOOKING_NOTIFICATION_WEBHOOK` is configured, the backend also sends a POST notification there.

## Admin Dashboard

Create an admin token:

```http
POST /admin/login
Content-Type: application/json
```

```json
{
  "email": "admin@velvetnights.in",
  "password": "admin123"
}
```

Admin routes require this header:

```http
Authorization: Bearer <jwt-token>
```

Set `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and `JWT_SECRET` in production.

```http
GET /admin/dashboard
```

Returns totals and latest bookings/messages.

```http
GET /admin/bookings
```

Returns all bookings, newest first.

```http
GET /admin/bookings?status=pending
```

Returns only pending bookings.

## Booking Status

```http
PATCH /bookings/:id/status
Content-Type: application/json
```

```json
{
  "status": "confirmed"
}
```

Allowed statuses:

```text
pending, confirmed, cancelled, completed
```

## Update Booking

Admin token required.

```http
PATCH /bookings/:id
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

```json
{
  "eventDate": "2026-05-29",
  "eventTime": "08:30 PM",
  "guestCount": 4,
  "packageId": "signature",
  "addons": ["addon-cake"],
  "notes": "Updated notes",
  "location": "Chennai"
}
```

Booking creation and updates validate phone, email, future event date, positive guest count, package ID, and add-on IDs. Pending/confirmed bookings cannot share the same date, time, package, and location.
