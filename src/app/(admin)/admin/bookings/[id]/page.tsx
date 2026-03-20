export default function BookingDetailPage({ params }: { params: { id: string } }) {
  return (
    <div>
      <h1>Booking Detail</h1>
      <p>Booking ID: {params.id}</p>
    </div>
  );
}