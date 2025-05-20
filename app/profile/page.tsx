export default function ProfilePage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
          <p className="text-muted-foreground mt-1">Manage your account settings and preferences</p>
        </div>
      </div>

      <div className="flex items-center justify-center h-64 border rounded-lg">
        <p className="text-muted-foreground">Profile settings coming soon</p>
      </div>
    </div>
  )
}
