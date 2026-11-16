import { NewPatientForm } from "@/components/staff-forms";
import { ART, PageHead, StaffPage } from "@/components/staff-ui";
import { clinicDate } from "@/lib/staff/format";
import { requireStaff } from "@/lib/staff/session";

export default async function StaffNewPatientPage() {
  await requireStaff();

  return (
    <StaffPage>
      <PageHead
        art={ART.new}
        title="New patient"
        lead="Creates the patient and their billing account. They pay online with the account number and their date of birth."
      />
      <NewPatientForm today={clinicDate()} />
    </StaffPage>
  );
}
