import { Button, MenuItem, Paper, TextField } from "@mui/material";
import { Link } from "react-router";
import { PageHeading } from "../components/PageHeading";

export const CreateTicketPage = () => (
  <>
    <PageHeading
      title="Create a ticket"
      description="Capture the details so the right person can take a look."
    />
    <Paper className="ticket-form-panel" elevation={0}>
      <div className="form-panel-heading">
        <h2>Request details</h2>
        <p>Fields marked with an asterisk are required.</p>
      </div>
      <div className="ticket-form-fields">
        <TextField
          label="Subject"
          placeholder="What do you need help with?"
          required
          fullWidth
        />
        <div className="form-field-row">
          <TextField label="Category" select defaultValue="" required fullWidth>
            <MenuItem value="" disabled>
              Choose a category
            </MenuItem>
            <MenuItem value="account">Account access</MenuItem>
            <MenuItem value="billing">Billing</MenuItem>
            <MenuItem value="technical">Technical issue</MenuItem>
            <MenuItem value="other">Other</MenuItem>
          </TextField>
          <TextField label="Priority" select defaultValue="normal" fullWidth>
            <MenuItem value="low">Low</MenuItem>
            <MenuItem value="normal">Normal</MenuItem>
            <MenuItem value="high">High</MenuItem>
          </TextField>
        </div>
        <TextField
          label="Description"
          placeholder="Add any details that will help us understand the request."
          required
          fullWidth
          multiline
          minRows={5}
        />
      </div>
      <div className="form-actions">
        <Button component={Link} to="/tickets" variant="text" color="inherit">
          Cancel
        </Button>
        <Button variant="contained">Create ticket</Button>
      </div>
    </Paper>
  </>
);
