export function CandidateProfileLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ff6b35] mx-auto mb-4" />
          <h2 className="text-xl text-gray-900 mb-2">Loading candidate profile</h2>
          <p className="text-gray-600">Fetching the latest candidate details from the backend.</p>
        </div>
      </div>
    </div>
  );
}
