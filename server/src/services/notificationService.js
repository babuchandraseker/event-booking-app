const notifyAdminAboutBooking = async (booking) => {
  const summary = [
    `New booking: ${booking.name}`,
    `Phone: ${booking.phone}`,
    `Date: ${booking.eventDate}`,
    `Time: ${booking.eventTime || "Not selected"}`,
    `Package: ${booking.packageId}`,
  ].join(" | ");

  console.log(summary);

  if (!process.env.BOOKING_NOTIFICATION_WEBHOOK) {
    return;
  }

  try {
    const response = await fetch(process.env.BOOKING_NOTIFICATION_WEBHOOK, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "new_booking",
        text: summary,
        booking,
      }),
    });

    if (!response.ok) {
      console.error(`Booking notification failed with status ${response.status}`);
    }
  } catch (error) {
    console.error(`Booking notification failed: ${error.message}`);
  }
};

module.exports = {
  notifyAdminAboutBooking,
};
