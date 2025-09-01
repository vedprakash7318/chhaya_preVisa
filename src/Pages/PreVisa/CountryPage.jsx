import React, { useState, useEffect } from "react";
import axios from "axios";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Dialog } from "primereact/dialog";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const CountryPage = () => {
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [globalFilter, setGlobalFilter] = useState("");
  const [dialogVisible, setDialogVisible] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [formData, setFormData] = useState({ countryName: "" });
  const [selectedId, setSelectedId] = useState(null);

  const API_URL = "http://localhost:5000/api/countries";

  // Fetch all countries
  const fetchCountries = async () => {
    try {
      setLoading(true);
      const res = await axios.get(API_URL);
      setCountries(res.data.data);
    } catch (err) {
      toast.error("Error fetching countries");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCountries();
  }, []);

  // Handle input change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Open modal for add
  const openAddDialog = () => {
    setFormData({ countryName: "" });
    setIsEdit(false);
    setDialogVisible(true);
  };

  // Open modal for edit
  const openEditDialog = (row) => {
    setFormData({ countryName: row.countryName });
    setSelectedId(row._id);
    setIsEdit(true);
    setDialogVisible(true);
  };

  // Submit form (add or edit)
  const handleSubmit = async () => {
    try {
      if (isEdit) {
        await axios.put(`${API_URL}/${selectedId}`, formData);
        toast.success("Country updated successfully");
      } else {
        await axios.post(API_URL, formData);
        toast.success("Country added successfully");
      }
      setDialogVisible(false);
      fetchCountries();
    } catch (err) {
      toast.error("Error saving country");
    }
  };

  // Delete country
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this country?")) {
      try {
        await axios.delete(`${API_URL}/${id}`);
        toast.success("Country deleted successfully");
        fetchCountries();
      } catch (err) {
        toast.error("Error deleting country");
      }
    }
  };

  // Action buttons
  const actionTemplate = (row) => (
    <div className="flex gap-2">
      <Button
        icon="pi pi-pencil"
        className="p-button-rounded p-button-warning"
        onClick={() => openEditDialog(row)}
      />
      <Button
        icon="pi pi-trash"
        className="p-button-rounded p-button-danger"
        onClick={() => handleDelete(row._id)}
      />
    </div>
  );

  return (
    <div className="p-6">
      <ToastContainer />
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Country Management</h2>
        <Button label="Add Country" icon="pi pi-plus" onClick={openAddDialog} />
      </div>

      <span className="p-input-icon-left mb-3">
        <i className="pi pi-search" />
        <InputText
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          placeholder="Search countries"
        />
      </span>

      <DataTable
        value={countries}
        paginator
        rows={5}
        loading={loading}
        globalFilter={globalFilter}
        emptyMessage="No countries found"
      >
        <Column field="countryName" header="Country Name" sortable />
        <Column
          body={(row) => new Date(row.createdAt).toLocaleString()}
          header="Created At"
          sortable
        />
        <Column body={actionTemplate} header="Actions" />
      </DataTable>

      {/* Modal Dialog */}
      <Dialog
        header={isEdit ? "Edit Country" : "Add Country"}
        visible={dialogVisible}
        style={{ width: "400px" }}
        onHide={() => setDialogVisible(false)}
      >
        <div className="p-fluid">
          <div className="field">
            <label htmlFor="countryName">Country Name</label>
            <InputText
              id="countryName"
              name="countryName"
              value={formData.countryName}
              onChange={handleChange}
              required
            />
          </div>
          <div className="flex justify-end mt-3 gap-2">
            <Button
              label="Cancel"
              className="p-button-text"
              onClick={() => setDialogVisible(false)}
            />
            <Button label={isEdit ? "Update" : "Save"} onClick={handleSubmit} />
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default CountryPage;
