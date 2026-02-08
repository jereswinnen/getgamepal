import { redirect } from "next/navigation";

export default async function SharingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // If the app didn't intercept this Universal Link, the user doesn't have GamePal.
  // Redirect to the App Store.
  redirect("https://apps.apple.com/us/app/gamepal/id6563138879");
}
