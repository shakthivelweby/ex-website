import { useState } from "react";

const AskLocation = () => {
  const [location, setLocation] = useState("");
  useEffect(() => {
    window.addEventListener("message", (event) => {
      if (event.data.type === "location") {
        setLocation(event.data.location);
      }
    });
  }, []);
};

export default AskLocation;
