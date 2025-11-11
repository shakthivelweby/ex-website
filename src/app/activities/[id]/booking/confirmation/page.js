import ConfirmationClient from "./ConfirmationClient";

const ConfirmationPage = async ({ params }) => {
  const { id } = await params;
  
  return <ConfirmationClient activityId={id} />;
};

export default ConfirmationPage;

