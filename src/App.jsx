import React, { useState } from 'react';
import { Plus, Trash2, Download, ReceiptText, Calendar, Building2, Tag } from 'lucide-react';
import { generateInvoiceData, exportToExcel } from './utils/generator';
import './App.css';

export default function App() {
  const [config, setConfig] = useState({ startInvoice: 'INV-001', startDate: '', endDate: '', isWithinState: true });
  const [parties, setParties] = useState([{ name: '', amount: '', gstin: '' }]);
  const [hsnCodes, setHsnCodes] = useState([{ code: '', price: '' }]);

  const handleDownload = () => {
    if (!config.startDate || !config.endDate) return alert("Please select dates");
    const data = generateInvoiceData(config, parties, hsnCodes);
    exportToExcel(data);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-10 flex items-center justify-between bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-4">
            {/* <div className="p-3 bg-indigo-600 rounded-xl text-white">
              <ReceiptText size={28} />
            </div> */}
            <div>
              <h1 className="text-2xl font-bold text-white">B2B Generator</h1>
              <p className="text-white text-xl">Automated Tally-ready Excel creator</p>
            </div>
          </div>

        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Settings Section */}
          <div className="panel">
            <h2 className="section-title"><Calendar size={18} /> Settings</h2>
            <div className="space-y-4">
              <div>
                <label>Starting Invoice</label>
                <input value={config.startInvoice} onChange={e => setConfig({ ...config, startInvoice: e.target.value })} placeholder="INV-001" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label>From</label>
                  <input type="date" onChange={e => setConfig({ ...config, startDate: e.target.value })} />
                </div>
                <div>
                  <label>To</label>
                  <input type="date" onChange={e => setConfig({ ...config, endDate: e.target.value })} />
                </div>
              </div>
              <div>
                <label>Location Type</label>
                <div className="toggle-group">
                  <button className={config.isWithinState ? 'active' : ''} onClick={() => setConfig({ ...config, isWithinState: true })}>Intra-State</button>
                  <button className={!config.isWithinState ? 'active' : ''} onClick={() => setConfig({ ...config, isWithinState: false })}>Inter-State</button>
                </div>
                <p className="limit-info">Daily Cap: {config.isWithinState ? '₹95,000' : '₹45,000'}</p>
              </div>
            </div>
          </div>

          {/* Parties Section */}
          <div className="panel lg:col-span-1">
            <div className="flex justify-between items-center mb-4">
              <h2 className="section-title"><Building2 size={18} /> Parties</h2>
              <button className="add-small" onClick={() => setParties([...parties, { name: '', amount: '', gstin: '' }])}><Plus size={14} /></button>
            </div>
            <div className="space-y-3">
              {parties.map((p, i) => (
                <div key={i} className="card-item">
                  <input placeholder="Company Name" value={p.name} onChange={e => {
                    const n = [...parties]; n[i].name = e.target.value; setParties(n);
                  }} />
                  <div className="flex gap-2 mt-2">
                    <input placeholder="GSTIN" value={p.gstin} onChange={e => {
                      const n = [...parties]; n[i].gstin = e.target.value; setParties(n);
                    }} />
                    <input type="number" placeholder="Budget" value={p.amount} onChange={e => {
                      const n = [...parties]; n[i].amount = e.target.value; setParties(n);
                    }} />
                    <button className="del-btn" onClick={() => setParties(parties.filter((_, idx) => idx !== i))}><Trash2 size={16} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* HSN Section */}
          <div className="panel lg:col-span-1">
            <div className="flex justify-between items-center mb-4">
              <h2 className="section-title"><Tag size={18} /> HSN Master</h2>
              <button className="add-small" onClick={() => setHsnCodes([...hsnCodes, { code: '', price: '' }])}><Plus size={14} /></button>
            </div>
            <div className="space-y-3">
              {hsnCodes.map((h, i) => (
                <div key={i} className="card-item">
                  <div className="flex gap-2">
                    <input placeholder="HSN Code" value={h.code} onChange={e => {
                      const n = [...hsnCodes]; n[i].code = e.target.value; setHsnCodes(n);
                    }} />
                    <input type="number" placeholder="Price" value={h.price} onChange={e => {
                      const n = [...hsnCodes]; n[i].price = e.target.value; setHsnCodes(n);
                    }} />
                    <button className="del-btn" onClick={() => setHsnCodes(hsnCodes.filter((_, idx) => idx !== i))}><Trash2 size={16} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <button onClick={handleDownload} className="download-btn">
            <Download size={20} /> Generate Excel
          </button>
        </div>
      </div>
    </div>
  );
}