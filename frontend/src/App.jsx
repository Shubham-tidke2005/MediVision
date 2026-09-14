import { useQuery } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { getBackendHealth } from "@/api/health";


function App() {
  const {
    data,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["backend-health"],
    queryFn: getBackendHealth,
  });


  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold">
          MediVision AI
        </h1>

        <p className="mt-3">
          AI-Powered Healthcare Assistance Platform
        </p>

        <div className="mt-6">
          {isLoading && (
            <p>Checking backend...</p>
          )}

          {isError && (
            <p>Backend connection failed.</p>
          )}

          {data && (
            <p>
              Backend status: {data.status}
            </p>
          )}
        </div>

        <Button className="mt-6">
          Environment Ready
        </Button>
      </div>
    </main>
  );
}

export default App;