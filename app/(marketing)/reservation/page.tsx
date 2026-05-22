import { ReservationShell } from "@/components/reservation/reservation-shell";

export const metadata = {
  title: "Réserver une session",
  description: "Réserver une session studio ou un DJ avec CBA.",
};

export default function ReservationPage() {
  return <ReservationShell />;
}
