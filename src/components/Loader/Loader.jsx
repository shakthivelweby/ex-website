import { useState, useEffect } from "react";

const Loader = ({ isLoading }) => {
  const [showLoader, setShowLoader] = useState(false);

  useEffect(() => {
    if (isLoading) {
      setShowLoader(true);
    } else {
      setShowLoader(false);
    }
  }, [isLoading]);

  return showLoader ? (
    <div className="fixed top-0 left-0 w-full h-full bg-white bg-opacity-50 flex items-center justify-center z-50">
      <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary border-dotted"></div>
    </div>
  ) : null;
};

export default Loader;
