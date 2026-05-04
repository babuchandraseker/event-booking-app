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

Admin routes require this header:

```http
x-admin-api-key: local-admin-123
```

Use a stronger key in production.

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
