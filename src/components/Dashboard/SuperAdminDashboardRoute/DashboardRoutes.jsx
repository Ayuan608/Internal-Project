
import { Route } from "react-router-dom";
import OverView from "../../../pages/TeamLeaderPages/OverView";


const DashboardRoutes = () => {
  return (
    <>
      <Route path="dashboard" element={<OverView />} />
    </>
  );
};

export default DashboardRoutes;
