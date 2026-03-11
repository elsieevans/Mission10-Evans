import { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";
import Heading from "./Heading";
import BowlerTable from "./BowlerTable";

function App() {
  const [bowlers, setBowlers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("http://localhost:5120/api/bowlers")
      .then((response) => {
        setBowlers(response.data);
      })
      .catch((error) => {
        console.error("Error fetching bowlers:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <p>Loading bowlers...</p>;
  }

  return (
    <div className="app">
      <Heading />
      <BowlerTable bowlers={bowlers} />
    </div>
  );
}

export default App;
