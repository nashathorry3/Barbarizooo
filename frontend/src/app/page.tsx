import BookingFlow from "@/components/BookingFlow";

// Default booking page → the demo salon (uses the default tenant). Each real
// salon has its own public link at /book/{slug}.
export default function HomePage() {
  return <BookingFlow />;
}
