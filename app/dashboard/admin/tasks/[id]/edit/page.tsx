import EditTaskClient from "./edit-task-client";

export default function EditTaskPage({
  params,
}: {
  params: { id: string };
}) {
  return <EditTaskClient taskId={params.id} />;
}