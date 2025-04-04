import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware";
import { retrieveGadgets , addGadget , updateGadget , deleteGadget , handleSelfDestruct ,filterGadgetsByStatus} from "../controllers/gadget.controller";

const router = Router() ; 

router.route('/get-gadgets').get(verifyJWT , retrieveGadgets);
router.route('/add-gadget').post(verifyJWT , addGadget);
router.route('/update-gadget/:id').patch(verifyJWT , updateGadget);
router.route('/delete-gadget/:id').delete(verifyJWT , deleteGadget);
router.route('/gadgets/:id/self-destruct').post(verifyJWT , handleSelfDestruct);
router.route('/filter-gadgets/status').get(verifyJWT , filterGadgetsByStatus);

export default router; 