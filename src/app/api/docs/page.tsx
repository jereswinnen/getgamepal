import Layout from "@/components/Layout";

export default function ApiDocs() {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">GamePal API Documentation</h1>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Overview</h2>
          <p className="mb-4">
            The GamePal API is a proxy to the IGDB API, allowing you to access
            game information while keeping your API credentials secure.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Endpoints</h2>

          <div className="bg-black/[.03] dark:bg-white/[.03] p-6 rounded-lg mb-6">
            <h3 className="text-xl font-medium mb-2">IGDB Proxy</h3>
            <p className="mb-4">
              All IGDB API endpoints are accessible through our proxy at{" "}
              <code className="bg-black/[.05] dark:bg-white/[.06] px-1 py-0.5 rounded font-[family-name:var(--font-geist-mono)]">
                /api/v4/[endpoint]
              </code>
            </p>
            <div className="mb-4">
              <h4 className="font-medium mb-1">Method</h4>
              <p>
                <code className="bg-black/[.05] dark:bg-white/[.06] px-1 py-0.5 rounded font-[family-name:var(--font-geist-mono)]">
                  POST
                </code>
              </p>
            </div>
            <div className="mb-4">
              <h4 className="font-medium mb-1">Body</h4>
              <p>
                The request body should be the IGDB API query in text format.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-1">Example</h4>
              <pre className="bg-black/[.05] dark:bg-white/[.06] p-3 rounded overflow-x-auto font-[family-name:var(--font-geist-mono)]">
                {`// Request to /api/v4/games
fields name, cover.url, summary;
where id = 1942;
limit 1;`}
              </pre>
            </div>
          </div>

          <div className="bg-black/[.03] dark:bg-white/[.03] p-6 rounded-lg">
            <h3 className="text-xl font-medium mb-2">Health Check</h3>
            <p className="mb-4">Check if the API is running properly.</p>
            <div className="mb-4">
              <h4 className="font-medium mb-1">Endpoint</h4>
              <p>
                <code className="bg-black/[.05] dark:bg-white/[.06] px-1 py-0.5 rounded font-[family-name:var(--font-geist-mono)]">
                  /api/v4/health
                </code>
              </p>
            </div>
            <div className="mb-4">
              <h4 className="font-medium mb-1">Method</h4>
              <p>
                <code className="bg-black/[.05] dark:bg-white/[.06] px-1 py-0.5 rounded font-[family-name:var(--font-geist-mono)]">
                  GET
                </code>
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-1">Response</h4>
              <pre className="bg-black/[.05] dark:bg-white/[.06] p-3 rounded overflow-x-auto font-[family-name:var(--font-geist-mono)]">
                {`{
  "status": "OK",
  "message": "Server is healthy"
}`}
              </pre>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">IGDB API Reference</h2>
          <p className="mb-4">
            For more information about the available endpoints and query syntax,
            please refer to the
            <a
              href="https://api-docs.igdb.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              {" "}
              official IGDB API documentation
            </a>
            .
          </p>
        </section>
      </div>
    </Layout>
  );
}
