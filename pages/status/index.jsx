import useSWR from "swr";

async function fetchStatus() {
  const response = await fetch("/api/v1/status");

  if (!response.ok) {
    throw new Error("Falha ao buscar o status da API.");
  }

  const responseBody = await response.json();

  return responseBody;
}

export default function StatusPage() {
  const { data, error, isLoading } = useSWR("status", fetchStatus, {
    refreshInterval: 10000,
  });

  const prettyJson = data ? JSON.stringify(data, null, 2) : "";

  return (
    <main>
      <section className="status-card">
        <h1>/api/v1/status</h1>
        <p className="description">
          Retorno da API em formato JSON atualizado.
        </p>

        {isLoading && <p className="state">Carregando status...</p>}
        {error && (
          <p className="state error">Não foi possível carregar os dados.</p>
        )}

        {data && <pre aria-label="status-json">{prettyJson}</pre>}
      </section>

      <style jsx>{`
        main {
          min-height: 100vh;
          display: grid;
          place-items: center;
          padding: 24px;
          background: linear-gradient(180deg, #f8fafc 0%, #eef2f7 100%);
          color: #0f172a;
          font-family: "IBM Plex Sans", "Segoe UI", sans-serif;
        }

        .status-card {
          width: min(760px, 100%);
          padding: 24px;
          border: 1px solid #dbe4ef;
          border-radius: 16px;
          background: rgba(255, 255, 255, 0.9);
          box-shadow: 0 14px 40px rgba(15, 23, 42, 0.08);
          backdrop-filter: blur(4px);
        }

        h1 {
          margin: 0 0 8px;
          font-size: clamp(1.2rem, 2.2vw, 1.6rem);
          line-height: 1.1;
          font-weight: 600;
        }

        .description {
          margin: 0 0 16px;
          color: #475569;
          font-size: 0.95rem;
        }

        .state {
          margin: 14px 0;
          color: #334155;
        }

        .error {
          color: #b91c1c;
        }

        pre {
          margin: 0;
          padding: 16px;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          background: #f8fafc;
          color: #0f172a;
          overflow: auto;
          line-height: 1.45;
          font-size: 0.9rem;
          font-family: "IBM Plex Mono", "Fira Code", monospace;
        }
      `}</style>
    </main>
  );
}
