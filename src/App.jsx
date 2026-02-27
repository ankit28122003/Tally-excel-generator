import React, { useState } from 'react';
import { Plus, Trash2, Download, ShieldCheck, Building2, Package, AlertCircle, Settings } from 'lucide-react';
import { generateInvoiceData, exportToExcel } from './utils/generator';
import './App.css';

const APP_PASSWORD = "ANKIT"; 

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passInput, setPassInput] = useState("");
  const [error, setError] = useState(null);

  const [config, setConfig] = useState({ startInvoice: '1001', startDate: '', endDate: '' });
  const [parties, setParties] = useState([{ name: '', gstin: '', budget: '', isWithinState: true }]);
  const [hsnList, setHsnList] = useState([{ id: '', price: '', totalValue: '', rate: '18' }]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (passInput === APP_PASSWORD) setIsAuthenticated(true);
    else alert("Incorrect Password");
  };

  const handleGenerate = () => {
    setError(null);
    try {
      if (!config.startDate || !config.endDate) throw new Error("Please select a date range.");
      const data = generateInvoiceData(config, parties, hsnList);
      exportToExcel(data);
    } catch (err) { setError(err.message); }
  };

  if (!isAuthenticated) {
    return (
      <div className="center-wrapper">
        <form className="auth-card" onSubmit={handleLogin}>
          <div className="auth-icon"><ShieldCheck size={40} /></div>
          <h2>System Locked</h2>
          <input type="password" placeholder="Enter Access Password" value={passInput} onChange={e => setPassInput(e.target.value)} />
          <button type="submit">Unlock Dashboard</button>
        </form>
      </div>
    );
  }

  return (
    <div className="center-wrapper">
      <div className="main-container">
        <header className="hero-section">
          <h1>B2B Sheet Generator</h1>
          <p>Professional Tally-Compatible Invoice Engine</p>
        </header>

        {error && <div className="error-alert"><AlertCircle size={20}/> {error}</div>}

        <div className="stack">
          <section className="glass-card">
            <h3 className="section-title"><Settings size={18}/> Global Configuration</h3>
            <div className="grid-2">
              <div className="input-group">
                <label>Starting Invoice No.</label>
                <input value={config.startInvoice} onChange={e => setConfig({...config, startInvoice: e.target.value})} />
              </div>
              <div className="grid-2">
                <div className="input-group">
                  <label>Start Date</label>
                  <input type="date" onChange={e => setConfig({...config, startDate: e.target.value})} />
                </div>
                <div className="input-group">
                  <label>End Date</label>
                  <input type="date" onChange={e => setConfig({...config, endDate: e.target.value})} />
                </div>
              </div>
            </div>
          </section>

          <section className="glass-card">
            <div className="flex-between">
              <h3 className="section-title"><Building2 size={18}/> Parties Master</h3>
              <button className="add-pill" onClick={() => setParties([...parties, {name:'', gstin:'', budget:'', isWithinState: true}])}>+ Add Party</button>
            </div>
            <div className="list-stack">
              {parties.map((p, i) => (
                <div key={i} className="list-item">
                  <div className="grid-3">
                    <input placeholder="Company Name" value={p.name} onChange={e => {
                      const n = [...parties]; n[i].name = e.target.value; setParties(n);
                    }} />
                    <input placeholder="GSTIN" value={p.gstin} onChange={e => {
                      const n = [...parties]; n[i].gstin = e.target.value; setParties(n);
                    }} />
                    <input type="number" placeholder="Monthly Budget" value={p.budget} onChange={e => {
                      const n = [...parties]; n[i].budget = e.target.value; setParties(n);
                    }} />
                  </div>
                  <div className="grid-item-footer">
                    <select value={p.isWithinState} onChange={e => {
                      const n = [...parties]; n[i].isWithinState = e.target.value === 'true'; setParties(n);
                    }}>
                      <option value="true">Within State (95k Daily Cap)</option>
                      <option value="false">Outside State (45k Daily Cap)</option>
                    </select>
                    <button className="del-btn" onClick={() => setParties(parties.filter((_, idx) => idx !== i))}><Trash2 size={16}/></button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="glass-card">
            <div className="flex-between">
              <h3 className="section-title"><Package size={18}/> Product & HSN Settings</h3>
              <button className="add-pill" onClick={() => setHsnList([...hsnList, {id:'', price:'', totalValue:'', rate: '18'}])}>+ New Product</button>
            </div>
            <div className="list-stack">
              {hsnList.map((h, i) => (
                <div key={i} className="list-item">
                  <div className="grid-4">
                    <input placeholder="HSN Code" value={h.id} onChange={e => {
                      const n = [...hsnList]; n[i].id = e.target.value; setHsnList(n);
                    }} />
                    <input type="number" placeholder="Tax %" value={h.rate} onChange={e => {
                      const n = [...hsnList]; n[i].rate = e.target.value; setHsnList(n);
                    }} />
                    <input type="number" placeholder="Price/Unit" value={h.price} onChange={e => {
                      const n = [...hsnList]; n[i].price = e.target.value; setHsnList(n);
                    }} />
                    <div className="flex-gap">
                      <input type="number" placeholder="Total Stock" value={h.totalValue} onChange={e => {
                        const n = [...hsnList]; n[i].totalValue = e.target.value; setHsnList(n);
                      }} />
                      <button className="del-btn" onClick={() => setHsnList(hsnList.filter((_, idx) => idx !== i))}><Trash2 size={16}/></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <button className="primary-download" onClick={handleGenerate}>
            <Download size={20} /> Generate and Download Excel Sheet
          </button>
        </div>
      </div>
    </div>
  );
}