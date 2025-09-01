import React, { useState, useEffect } from "react";
import axios from "axios";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";

const JobPage = () => {
  const [jobs, setJobs] = useState([]);
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [globalFilter, setGlobalFilter] = useState("");
  const [dialogVisible, setDialogVisible] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [formData, setFormData] = useState({
    jobTitle: "",
    description: "",
    WorkTime: "",
    salary: "",
    serviceCharge: "",
    adminCharge: "",
    country: ""
  });
  const [formErrors, setFormErrors] = useState({});
  const [selectedId, setSelectedId] = useState(null);

  const JOB_API = "http://localhost:5000/api/jobs";
  const COUNTRY_API = "http://localhost:5000/api/countries";

  // Fetch jobs
  const fetchJobs = async () => {
    try {
      setLoading(true);
      const res = await axios.get(JOB_API);
      setJobs(res.data.data);
    } catch (err) {
      toast.error("Error fetching jobs");
    } finally {
      setLoading(false);
    }
  };

  // Fetch countries
  const fetchCountries = async () => {
    try {
      const res = await axios.get(COUNTRY_API);
      setCountries(res.data.data.map(c => ({ label: c.countryName, value: c._id })));
    } catch (err) {
      toast.error("Error fetching countries");
    }
  };

  useEffect(() => {
    fetchJobs();
    fetchCountries();
  }, []);

  // Input change handlers
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: "" });
    }
  };

  const handleNumericChange = (e, field) => {
    setFormData({ ...formData, [field]: e.value });
    if (formErrors[field]) {
      setFormErrors({ ...formErrors, [field]: "" });
    }
  };

  const handleDropdown = (e) => {
    setFormData({ ...formData, country: e.value });
    if (formErrors.country) {
      setFormErrors({ ...formErrors, country: "" });
    }
  };

  // Validate form
  const validateForm = () => {
    const errors = {};
    
    if (!formData.jobTitle.trim()) errors.jobTitle = "Job title is required";
    if (!formData.country) errors.country = "Country is required";
    if (!formData.serviceCharge && formData.serviceCharge !== 0) errors.serviceCharge = "Service charge is required";
    if (!formData.adminCharge && formData.adminCharge !== 0) errors.adminCharge = "Admin charge is required";
    if (formData.serviceCharge < 0) errors.serviceCharge = "Service charge cannot be negative";
    if (formData.adminCharge < 0) errors.adminCharge = "Admin charge cannot be negative";
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Open Add modal
  const openAddDialog = () => {
    setFormData({
      jobTitle: "",
      description: "",
      WorkTime: "",
      salary: "",
      serviceCharge: "",
      adminCharge: "",
      country: ""
    });
    setFormErrors({});
    setIsEdit(false);
    setDialogVisible(true);
  };

  // Open Edit modal
  const openEditDialog = (row) => {
    setFormData({
      jobTitle: row.jobTitle,
      description: row.description || "",
      WorkTime: row.WorkTime || "",
      salary: row.salary || "",
      serviceCharge: row.serviceCharge,
      adminCharge: row.adminCharge,
      country: row.country?._id
    });
    setFormErrors({});
    setSelectedId(row._id);
    setIsEdit(true);
    setDialogVisible(true);
  };

  // Submit form
  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    try {
      const submitData = {
        ...formData,
        WorkTime: formData.WorkTime.trim()
      };
      
      if (isEdit) {
        await axios.put(`${JOB_API}/${selectedId}`, submitData);
        toast.success("Job updated successfully");
      } else {
        await axios.post(JOB_API, submitData);
        toast.success("Job added successfully");
      }
      setDialogVisible(false);
      fetchJobs();
    } catch (err) {
      toast.error(err.response?.data?.message || "Error saving job");
    }
  };

  // Delete job
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this job?")) {
      try {
        await axios.delete(`${JOB_API}/${id}`);
        toast.success("Job deleted successfully");
        fetchJobs();
      } catch (err) {
        toast.error("Error deleting job");
      }
    }
  };

  // Format number without currency symbol
  const formatNumber = (value) => {
    if (value === null || value === undefined || isNaN(value)) {
      return '0.00';
    }
    return Number(value).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  // Template functions for columns
  const salaryTemplate = (row) => {
    return row.salary && row.salary !== 0 ? formatNumber(row.salary) : '-';
  };

  const serviceChargeTemplate = (row) => {
    return formatNumber(row.serviceCharge);
  };

  const adminChargeTemplate = (row) => {
    return formatNumber(row.adminCharge);
  };

  const workTimeTemplate = (row) => {
    return row.WorkTime || '-';
  };

  const countryTemplate = (row) => {
    return row.country?.countryName || '-';
  };

  const createdDateTemplate = (row) => {
    return new Date(row.createdAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const actionTemplate = (row) => (
    <div className="flex gap-2">
      <Button 
        icon="pi pi-pencil" 
        className="p-button-rounded p-button-warning p-button-sm" 
        onClick={() => openEditDialog(row)}
        tooltip="Edit"
      />
      <Button 
        icon="pi pi-trash" 
        className="p-button-rounded p-button-danger p-button-sm" 
        onClick={() => handleDelete(row._id)}
        tooltip="Delete"
      />
    </div>
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <ToastContainer position="top-right" autoClose={3000} />
      
      {/* Header Section */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Job Management</h1>
            <p className="text-gray-600 mt-1">Manage and organize job listings</p>
          </div>
          <Button 
            label="Add New Job" 
            icon="pi pi-plus" 
            className="p-button-success"
            onClick={openAddDialog} 
          />
        </div>
      </div>

      {/* Table Header Section */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-center mb-4">
          <i className="pi pi-briefcase text-2xl text-blue-600 mr-3"></i>
          <h2 className="text-xl font-semibold text-gray-800">Job Table</h2>
        </div>
        
        <div className="flex justify-between items-center">
          <div className="relative w-80">
            <i className="pi pi-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
            <InputText 
              value={globalFilter} 
              onChange={(e) => setGlobalFilter(e.target.value)} 
              placeholder="Search jobs..." 
              className="w-full pl-10"
            />
          </div>
          <div className="flex items-center bg-blue-50 px-4 py-2 rounded-lg">
            <i className="pi pi-chart-bar text-blue-600 mr-2"></i>
            <span className="text-blue-700 font-semibold">
              Total Jobs: {jobs.length}
            </span>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <DataTable 
          value={jobs} 
          paginator 
          rows={10} 
          rowsPerPageOptions={[5, 10, 25, 50]}
          loading={loading} 
          globalFilter={globalFilter} 
          emptyMessage="No jobs found"
          className="p-datatable-striped"
          responsiveLayout="scroll"
          paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
          currentPageReportTemplate="Showing {first} to {last} of {totalRecords} jobs"
        >
          <Column 
            field="jobTitle" 
            header="Job Title" 
            sortable 
            filter 
            filterPlaceholder="Search by title"
            style={{ minWidth: '200px' }}
            className="font-semibold"
          />
          <Column 
            field="description" 
            header="Description" 
            style={{ minWidth: '250px' }}
            body={(row) => (
              <div className="max-w-xs truncate" title={row.description}>
                {row.description || '-'}
              </div>
            )}
          />
          <Column 
            field="WorkTime" 
            header="Work Time" 
            body={workTimeTemplate} 
            sortable 
            style={{ minWidth: '150px' }}
          />
          <Column 
            field="salary" 
            header="Salary" 
            body={salaryTemplate} 
            sortable 
            style={{ minWidth: '120px' }}
            className="text-green-600 font-semibold"
          />
          <Column 
            field="serviceCharge" 
            header="Service Charge" 
            body={serviceChargeTemplate} 
            sortable 
            style={{ minWidth: '140px' }}
            className="text-blue-600"
          />
          <Column 
            field="adminCharge" 
            header="Admin Charge" 
            body={adminChargeTemplate} 
            sortable 
            style={{ minWidth: '140px' }}
            className="text-orange-600"
          />
          <Column 
            field="country.countryName" 
            header="Country" 
            body={countryTemplate} 
            sortable 
            filter
            filterPlaceholder="Search by country"
            style={{ minWidth: '120px' }}
          />
          <Column 
            field="createdAt" 
            header="Created Date" 
            body={createdDateTemplate} 
            sortable 
            style={{ minWidth: '120px' }}
          />
          <Column 
            body={actionTemplate} 
            header="Actions" 
            style={{ width: '100px' }}
            frozen
            alignFrozen="right"
          />
        </DataTable>
      </div>

      {/* Modal Dialog */}
      <Dialog 
        header={
          <div className="flex items-center gap-3">
            <i className={`pi ${isEdit ? 'pi-pencil' : 'pi-plus'} text-blue-600`}></i>
            <span>{isEdit ? "Edit Job" : "Add New Job"}</span>
          </div>
        } 
        visible={dialogVisible} 
        style={{ width: "600px" }} 
        onHide={() => setDialogVisible(false)}
        className="p-fluid"
        modal
        blockScroll
      >
        <div className="grid grid-cols-1 gap-4 p-4">
          {/* Job Title */}
          <div className="field">
            <label htmlFor="jobTitle" className="font-semibold text-gray-700 mb-2 block">
              Job Title <span className="text-red-500">*</span>
            </label>
            <InputText 
              id="jobTitle" 
              name="jobTitle" 
              value={formData.jobTitle} 
              onChange={handleChange} 
              className={`w-full ${formErrors.jobTitle ? 'p-invalid' : ''}`}
              placeholder="Enter job title"
            />
            {formErrors.jobTitle && <small className="p-error block mt-1">{formErrors.jobTitle}</small>}
          </div>
          
          {/* Description */}
          <div className="field">
            <label htmlFor="description" className="font-semibold text-gray-700 mb-2 block">
              Description
            </label>
            <InputText 
              id="description" 
              name="description" 
              value={formData.description} 
              onChange={handleChange} 
              className="w-full"
              placeholder="Enter job description"
            />
          </div>
          
          {/* Work Time */}
          <div className="field">
            <label htmlFor="WorkTime" className="font-semibold text-gray-700 mb-2 block">
              Work Time
            </label>
            <InputText 
              id="WorkTime" 
              name="WorkTime" 
              value={formData.WorkTime} 
              onChange={handleChange} 
              className="w-full"
              placeholder="e.g., 9am-5pm, Full-time, Part-time"
            />
          </div>
          
          {/* Salary */}
          <div className="field">
            <label htmlFor="salary" className="font-semibold text-gray-700 mb-2 block">
              Salary
            </label>
            <InputNumber 
              id="salary" 
              value={formData.salary} 
              onValueChange={(e) => handleNumericChange(e, 'salary')} 
              mode="decimal" 
              minFractionDigits={2}
              maxFractionDigits={2}
              className="w-full"
              placeholder="Enter salary amount"
            />
          </div>
          
          {/* Charges Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="field">
              <label htmlFor="serviceCharge" className="font-semibold text-gray-700 mb-2 block">
                Service Charge <span className="text-red-500">*</span>
              </label>
              <InputNumber 
                id="serviceCharge" 
                value={formData.serviceCharge} 
                onValueChange={(e) => handleNumericChange(e, 'serviceCharge')} 
                mode="decimal" 
                minFractionDigits={2}
                maxFractionDigits={2}
                className={`w-full ${formErrors.serviceCharge ? 'p-invalid' : ''}`}
                placeholder="0.00"
              />
              {formErrors.serviceCharge && <small className="p-error block mt-1">{formErrors.serviceCharge}</small>}
            </div>
            
            <div className="field">
              <label htmlFor="adminCharge" className="font-semibold text-gray-700 mb-2 block">
                Admin Charge <span className="text-red-500">*</span>
              </label>
              <InputNumber 
                id="adminCharge" 
                value={formData.adminCharge} 
                onValueChange={(e) => handleNumericChange(e, 'adminCharge')} 
                mode="decimal" 
                minFractionDigits={2}
                maxFractionDigits={2}
                className={`w-full ${formErrors.adminCharge ? 'p-invalid' : ''}`}
                placeholder="0.00"
              />
              {formErrors.adminCharge && <small className="p-error block mt-1">{formErrors.adminCharge}</small>}
            </div>
          </div>
          
          {/* Country */}
          <div className="field">
            <label htmlFor="country" className="font-semibold text-gray-700 mb-2 block">
              Country <span className="text-red-500">*</span>
            </label>
            <Dropdown 
              value={formData.country} 
              options={countries} 
              onChange={handleDropdown} 
              placeholder="Select a Country" 
              className={`w-full ${formErrors.country ? 'p-invalid' : ''}`}
              filter
              showClear
            />
            {formErrors.country && <small className="p-error block mt-1">{formErrors.country}</small>}
          </div>
        </div>
        
        {/* Dialog Footer */}
        <div className="flex justify-end gap-3 p-4 border-t">
          <Button 
            label="Cancel" 
            className="p-button-text p-button-secondary" 
            onClick={() => setDialogVisible(false)} 
          />
          <Button 
            label={isEdit ? "Update Job" : "Save Job"} 
            className="p-button-primary"
            onClick={handleSubmit} 
            icon={isEdit ? "pi pi-check" : "pi pi-save"}
          />
        </div>
      </Dialog>
    </div>
  );
};

export default JobPage; 