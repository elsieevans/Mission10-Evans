import { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";
import Heading from "./Heading";
import BowlerTable from "./BowlerTable";

function App() {
  // keep the list of bowlers from the API in React state
  const [bowlers, setBowlers] = useState([]);
  // simple flag to show a loading message while the API call is in progress
  const [loading, setLoading] = useState(true);

  // fire off the API request once when the component first mounts
  useEffect(() => {
    axios
      .get("http://localhost:5120/api/bowlers")
      .then((response) => {
        // store the data from the ASP.NET API so I can pass it down to the table
        setBowlers(response.data);
      })
      .catch((error) => {
        // just logging the error to the console for now (good enough for this project)
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
      {/* simple heading at the top of the page */}
      <Heading />
      {/* table component that actually renders the bowler rows */}
      <BowlerTable bowlers={bowlers} />
    </div>
  );
}

export default App;
