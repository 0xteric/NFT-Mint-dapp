type MintStatusProps = {
  status: "idle" | "loading" | "success" | "error";
};

export default function MintStatus({ status }: MintStatusProps) {
  return (
    <div className="p-4">
      <p>
        Status: <strong>{status}</strong>
      </p>
    </div>
  );
}
