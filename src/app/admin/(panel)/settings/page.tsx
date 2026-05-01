import { getBusinessSettings } from "@/lib/business-settings"
import SettingsForm from "@/components/admin/SettingsForm"

export default async function AdminSettingsPage() {
  const settings = await getBusinessSettings()

  return (
    <SettingsForm
      initial={{
        name: settings.name,
        address: settings.address ?? "",
        phone: settings.phone ?? "",
        email: settings.email ?? "",
        instagram: settings.instagram ?? "",
        mapsEmbedUrl: settings.mapsEmbedUrl ?? "",
      }}
    />
  )
}
