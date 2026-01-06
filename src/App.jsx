<form className="card" onSubmit={handleSubmit}>
  {/* Campo de Humor */}
  <div className="form-group">
    <label>Qual o seu tom agora?</label>
    <select 
      value={formData.mood} 
      onChange={e => setFormData({...formData, mood: e.target.value})}
      style={{ borderLeft: `6px solid ${MOOD_COLORS[formData.mood]}` }}
    >
      <option value="happy">Verde Menta (Feliz)</option>
      <option value="neutral">Bege Neutro (Calmo)</option>
      <option value="sad">Azul Pastel (Triste)</option>
      <option value="anxious">Lavanda Clarinho (Ansioso)</option>
      <option value="angry">Coral Melancia (Bravo)</option>
    </select>
  </div>
  
  {/* Campo de Situação */}
  <div className="form-group">
    <label>O que houve?</label>
    <textarea 
      placeholder="Situação..." 
      value={formData.situation} 
      onChange={e => setFormData({...formData, situation: e.target.value})} 
    />
  </div>
  
  {/* Campo de Pensamentos */}
  <div className="form-group">
    <label>Pensamentos</label>
    <textarea 
      placeholder="O que pensou?" 
      value={formData.thoughts} 
      onChange={e => setFormData({...formData, thoughts: e.target.value})} 
    />
  </div>
  
  <button type="submit" className="btn-primary">
    <CheckCircle2 size={22} /> SALVAR NO DIÁRIO
  </button>
</form>
