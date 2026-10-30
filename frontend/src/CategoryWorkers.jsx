import { useParams } from "react-router-dom";

function CategoryWorkers() {
  const { category } = useParams();

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "40px",
        background: "#f4f7fc",
      }}
    >
      <h1>{category}</h1>

      <p>Workers list page</p>
    </div>
  );
}

export default CategoryWorkers;