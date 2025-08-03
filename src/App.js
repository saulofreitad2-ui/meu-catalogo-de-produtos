import React, { useState, useEffect, useCallback } from 'react';
// Importações do Firebase
import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { getFirestore, collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, getDocs, query, limit, writeBatch } from "firebase/firestore";
// As bibliotecas para ler ficheiros serão carregadas de um CDN.

// --- Configuração do Firebase ---
const firebaseConfig = {
  apiKey: "AIzaSyA_bH38IqamJhEoM61J85g40R52hoxDKsg",
  authDomain: "plastmap.firebaseapp.com",
  projectId: "plastmap",
  storageBucket: "plastmap.firebasestorage.app",
  messagingSenderId: "423049029585",
  appId: "1:423049029585:web:e32a78d5df80d0140622f0",
  measurementId: "G-2K944K1TZL"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// --- Componente de Estilos ---
const StyleInjector = () => {
  useEffect(() => {
    const styleTag = document.createElement('style');
    styleTag.innerHTML = `
      @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&family=Lora:wght@400;700&display=swap');
      
      :root {
        --bg-main: #f8f9fa;
        --bg-card: #ffffff;
        --border-color: #dee2e6;
        --text-primary: #212529;
        --text-secondary: #6c757d;
        --primary-color: #007bff;
        --primary-hover: #0056b3;
        --danger-color: #dc3545;
      }

      body {
        margin: 0;
        font-family: 'Poppins', sans-serif;
        background-color: var(--bg-main);
        color: var(--text-primary);
      }
      
      .app-container { display: flex; flex-direction: column; min-height: 100vh; }
      .header { background-color: var(--bg-card); padding: 1rem 1.5rem; border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
      .header-title { font-size: 1.5rem; font-weight: 600; margin: 0; color: var(--primary-color); }
      .search-section { display: flex; flex-direction: column; gap: 1rem; padding: 1rem 1.5rem; background-color: #e9ecef; border-bottom: 1px solid var(--border-color); }
      .input { flex-grow: 1; height: 50px; background-color: var(--bg-card); border-radius: 8px; padding: 0 1rem; color: var(--text-primary); font-size: 1rem; border: 1px solid var(--border-color); transition: all 0.2s; }
      .input:focus { outline: none; border-color: var(--primary-color); box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.25); }
      .button { height: 50px; background-color: var(--primary-color); color: white; border-radius: 8px; padding: 0 1.5rem; border: none; cursor: pointer; font-weight: 500; font-size: 1rem; transition: background-color 0.2s; white-space: nowrap; }
      .button:hover { background-color: var(--primary-hover); }
      .button-group { display: flex; gap: 1rem; }
      .logout-button { background-color: var(--danger-color); padding: 0.5rem 1rem; height: auto; }
      .product-list { flex-grow: 1; padding: 1.5rem; overflow-y: auto; }
      .product-container { background-color: var(--bg-card); padding: 1.5rem; border-radius: 12px; margin-bottom: 1.5rem; box-shadow: 0 4px 12px rgba(0,0,0,0.08); position: relative; border: 1px solid var(--border-color); transition: transform 0.2s, box-shadow 0.2s; }
      .product-container:hover { transform: translateY(-3px); box-shadow: 0 8px 16px rgba(0,0,0,0.1); }
      .product-actions { position: absolute; top: 1rem; right: 1rem; display: flex; gap: 0.5rem; }
      .action-button { background-color: #f1f3f5; color: var(--text-secondary); width: 32px; height: 32px; border-radius: 50%; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
      .action-button:hover { background-color: #e9ecef; color: var(--text-primary); }
      .action-button.delete:hover { background-color: var(--danger-color); color: white; }
      .product-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem; border-bottom: 1px solid var(--border-color); padding-bottom: 1rem; }
      .product-name { font-size: 1.25rem; font-weight: 600; margin: 0; color: var(--text-primary); }
      .product-type { font-size: 0.9rem; color: var(--text-secondary); }
      .product-section-title { font-size: 1rem; font-weight: 600; color: var(--primary-color); margin-top: 1.5rem; margin-bottom: 0.5rem; }
      .product-application { font-size: 0.9rem; color: var(--text-secondary); line-height: 1.6; }
      .reference-container { background-color: #f8f9fa; border: 1px solid var(--border-color); border-radius: 8px; padding: 1rem; margin-top: 0.5rem; }
      .reference-text { font-size: 0.9rem; color: var(--text-primary); margin: 0.25rem 0; }
      .details-grid { display: grid; grid-template-columns: 1fr; gap: 0.75rem; margin-top: 0.5rem; }
      .detail-item { background-color: #f8f9fa; padding: 0.75rem; border-radius: 6px; border: 1px solid var(--border-color); }
      .detail-label { font-size: 0.75rem; color: var(--text-secondary); font-weight: 500; }
      .detail-value { font-size: 0.9rem; color: var(--text-primary); font-weight: 500; }
      .no-products-container { flex-grow: 1; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; padding: 2rem; }
      .no-products-text { color: var(--text-secondary); font-size: 1.1rem; }
      .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background-color: rgba(0, 0, 0, 0.5); display: flex; justify-content: center; align-items: center; z-index: 1000; padding: 1rem; }
      .modal-content { background-color: var(--bg-card); padding: 2rem; border-radius: 12px; width: 100%; max-width: 600px; color: var(--text-primary); max-height: 90vh; overflow-y: auto; box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
      .modal-title { font-size: 1.5rem; font-weight: 600; margin-bottom: 1.5rem; text-align: center; }
      .form-grid { display: grid; grid-template-columns: 1fr; gap: 1rem; }
      .form-group { margin-bottom: 1rem; }
      .form-group-full { grid-column: 1 / -1; }
      .label { display: block; margin-bottom: 0.5rem; font-size: 0.9rem; color: var(--text-secondary); font-weight: 500; }
      .range-container { display: flex; align-items: center; gap: 0.5rem; }
      .modal-actions { display: flex; flex-direction: column; gap: 0.75rem; margin-top: 2rem; }
      .loading-screen { display: flex; justify-content: center; align-items: center; height: 100vh; color: var(--text-secondary); font-size: 1.1rem; }
      .uploader-container { display: flex; flex-direction: column; justify-content: center; align-items: center; height: 100vh; color: var(--text-primary); text-align: center; padding: 1rem; }
      .uploader-box { background-color: var(--bg-card); padding: 2.5rem; border-radius: 12px; box-shadow: 0 5px 15px rgba(0,0,0,0.1); width: 100%; max-width: 500px; }
      .file-input-label { background-color: var(--primary-color); color: white; padding: 1rem 2rem; border-radius: 8px; cursor: pointer; display: inline-block; margin-bottom: 1.5rem; font-weight: 600; }
      .progress-text { margin-top: 1.5rem; font-size: 1rem; color: var(--text-secondary); }
      
      /* Estilos para a Tela de Login (Tema Escuro - Novo Design) */
      .login-container-dark { display: flex; justify-content: center; align-items: center; height: 100vh; padding: 1rem; background-color: #343a40; }
      .login-box-dark { width: 100%; max-width: 400px; padding: 3rem; background-color: #212529; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.3); }
      .login-title-dark { color: #ffffff; text-align: center; margin-bottom: 2.5rem; font-size: 2.5rem; font-weight: 700; font-family: 'Lora', serif; }
      .login-input-dark { width: 100%; height: 50px; background-color: #ffffff; border-radius: 8px; padding: 0 1rem; color: #212529; font-size: 1rem; border: 1px solid #4a5568; transition: all 0.2s; box-sizing: border-box; }
      .login-input-dark:focus { outline: none; border-color: #007bff; box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.25); }
      .login-button-dark { width: 100%; height: 50px; background-color: #007bff; color: white; border-radius: 8px; border: none; cursor: pointer; font-weight: 600; font-size: 1rem; transition: background-color 0.2s; margin-top: 1rem; }
      .login-button-dark:hover { background-color: #0056b3; }
      .login-error-dark { color: #e53e3e; text-align: center; margin-bottom: 1rem; }
      .login-toggle-dark { color: #007bff; text-align: center; cursor: pointer; margin-top: 1.5rem; font-size: 0.9rem; text-decoration: none; }
      .login-toggle-dark:hover { text-decoration: underline; }

      @media (min-width: 640px) {
        .search-section { flex-direction: row; }
        .modal-actions { flex-direction: row; }
        .details-grid { grid-template-columns: 1fr 1fr; }
        .form-grid { grid-template-columns: 1fr 1fr; }
      }
    `;
    document.head.appendChild(styleTag);

    return () => {
      document.head.removeChild(styleTag);
    };
  }, []);

  return null;
};

// --- Componentes ---

const LoginScreen = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!formData.email.includes('@')) {
      setError('Por favor, insira um email válido');
      return false;
    }
    if (formData.password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      return false;
    }
    if (!isLogin && formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem');
      return false;
    }
    return true;
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      let userCredential;
      if (isLogin) {
        userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password);
      } else {
        userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      }
      onLogin(userCredential.user);
    } catch (err) {
      handleAuthError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuthError = (error) => {
    switch (error.code) {
      case 'auth/wrong-password':
      case 'auth/user-not-found':
      case 'auth/invalid-credential':
        setError('Email ou senha inválidos');
        break;
      case 'auth/email-already-in-use':
        setError('Este email já está cadastrado');
        break;
      case 'auth/weak-password':
        setError('A senha deve ter pelo menos 6 caracteres');
        break;
      default:
        setError('Ocorreu um erro. Tente novamente');
    }
  };

  return (
    <div className="login-container-dark">
      <div className="login-box-dark">
        <h1 className="login-title-dark">{isLogin ? 'Login' : 'Cadastro'}</h1>
        
        {error && <div className="login-error-dark">{error}</div>}
        
        <form onSubmit={handleAuth}>
          <div style={{ marginBottom: '1rem' }}>
            <input
              type="email"
              name="email"
              className="login-input-dark"
              placeholder="Email"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div style={{ marginBottom: '1rem' }}>
            <input
              type="password"
              name="password"
              className="login-input-dark"
              placeholder="Senha"
              value={formData.password}
              onChange={handleInputChange}
              required
            />
          </div>
          
          {!isLogin && (
            <div style={{ marginBottom: '1rem' }}>
              <input
                type="password"
                name="confirmPassword"
                className="login-input-dark"
                placeholder="Confirmar Senha"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required
              />
            </div>
          )}
          
          <button 
            type="submit" 
            className="login-button-dark"
            disabled={isLoading}
          >
            {isLoading ? 'Processando...' : isLogin ? 'Entrar' : 'Cadastrar'}
          </button>
        </form>
        
        <div 
          className="login-toggle-dark" 
          onClick={() => setIsLogin(!isLogin)}
        >
          {isLogin ? 'Não tem uma conta? Cadastre-se' : 'Já tem uma conta? Faça o login'}
        </div>
      </div>
    </div>
  );
};

const DataUploader = ({ onUploadComplete }) => {
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState('');

    const processAndUpload = async (data) => {
        const products = data;
        const total = products.length;
        setProgress(`A preparar para enviar ${total} produtos...`);

        const productsRef = collection(db, "products");
        const batches = [];
        for (let i = 0; i < products.length; i += 499) {
            const batch = writeBatch(db);
            const chunk = products.slice(i, i + 499);
            chunk.forEach((productRow) => {
                const newProductRef = doc(productsRef);
                const productValues = Object.values(productRow);
                const formattedProduct = {
                    produto: productValues[0] || '',
                    tipo: productValues[1] || '',
                    indiceFluidez: productValues[2] || '',
                    densidade: productValues[3] || '',
                    aplicacao: productValues[4] || '',
                    refAntiga: {
                        produto: productValues[5] || '',
                        fabricante: productValues[6] || '',
                        fluidez: productValues[7] || ''
                    },
                    refImportada: {
                        produto: productValues[8] || '',
                        indiceFluidez: productValues[9] || '',
                        densidade: productValues[10] || '',
                        fabricante: productValues[11] || ''
                    },
                    talco: productValues[12] || '',
                    va: productValues[13] || '',
                    observacoes: productValues[14] || ''
                };
                batch.set(newProductRef, formattedProduct);
            });
            batches.push(batch);
        }

        try {
            setProgress('A enviar dados para o servidor...');
            await Promise.all(batches.map(b => b.commit()));
            setProgress('Importação concluída com sucesso! A carregar o catálogo...');
            setTimeout(() => {
                onUploadComplete();
            }, 2000);
        } catch (error) {
            console.error("Erro ao enviar dados em massa: ", error);
            setProgress('Erro ao importar. Verifique as regras do Firestore e tente novamente.');
            setUploading(false);
        }
    };

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (!file) return;
        setUploading(true);

        const fileExtension = file.name.split('.').pop().toLowerCase();

        if (fileExtension === 'csv') {
            setProgress('A carregar o leitor de CSV...');
            loadScript('https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.3.2/papaparse.min.js', () => {
                window.Papa.parse(file, {
                    header: false,
                    skipEmptyLines: true,
                    delimiter: ";",
                    complete: (results) => {
                        const dataWithHeadersRemoved = results.data.slice(1);
                        processAndUpload(dataWithHeadersRemoved);
                    }
                });
            });
        } else if (fileExtension === 'xlsx') {
            setProgress('A carregar o leitor de Excel...');
            loadScript('https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js', () => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const data = new Uint8Array(e.target.result);
                    const workbook = window.XLSX.read(data, { type: 'array' });
                    const sheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[sheetName];
                    const json = window.XLSX.utils.sheet_to_json(worksheet, { header: 1 });
                    const dataWithHeadersRemoved = json.slice(1);
                    processAndUpload(dataWithHeadersRemoved);
                };
                reader.readAsArrayBuffer(file);
            });
        } else {
            setProgress('Formato de ficheiro não suportado. Por favor, use .csv ou .xlsx');
            setUploading(false);
        }
    };
    
    const loadScript = (src, onLoad) => {
        if (document.querySelector(`script[src="${src}"]`)) {
            onLoad();
            return;
        }
        const script = document.createElement('script');
        script.src = src;
        script.onload = onLoad;
        script.onerror = () => {
            setProgress('Erro ao carregar o leitor. Tente novamente.');
            setUploading(false);
        };
        document.body.appendChild(script);
    };

    return (
        <div className="uploader-container">
            <div className="uploader-box">
                <h2 className="modal-title">Importar Base de Dados</h2>
                <p style={{color: '#6c757d', marginBottom: '30px'}}>A sua base de dados está vazia. Carregue o seu ficheiro .xlsx ou .csv.</p>
                <label htmlFor="file-upload" className="file-input-label">
                    {uploading ? 'A processar...' : 'Escolher Ficheiro'}
                </label>
                <input id="file-upload" type="file" accept=".csv, .xlsx, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" className="file-input" onChange={handleFileUpload} disabled={uploading} />
                {progress && <p className="progress-text">{progress}</p>}
            </div>
        </div>
    );
};

const FilterModal = ({ show, onClose, onApply, onClear, currentFilters, productTypes }) => {
  const [filters, setFiltersState] = useState(currentFilters);
  useEffect(() => { setFiltersState(currentFilters); }, [currentFilters, show]);
  if (!show) return null;
  const handleChange = (field, value) => setFiltersState(prev => ({...prev, [field]: value}));
  return (
    <div className="modal-overlay"><div className="modal-content"><h2 className="modal-title">Filtros Avançados</h2><div className="form-group"><label className="label">Tipo</label>
        <select className="input" value={filters.type || ''} onChange={e=>handleChange('type', e.target.value)}>
            <option value="">Todos</option>
            {productTypes.map(type => <option key={type} value={type}>{type}</option>)}
        </select>
    </div><div className="form-group"><label className="label">Faixa de Fluidez</label><div className="range-container"><input type="text" className="input" value={filters.fluidityMin || ''} onChange={e=>handleChange('fluidityMin', e.target.value)} placeholder="Mín."/><input type="text" className="input" value={filters.fluidityMax || ''} onChange={e=>handleChange('fluidityMax', e.target.value)} placeholder="Máx."/></div></div><div className="form-group"><label className="label">Faixa de Densidade</label><div className="range-container"><input type="text" className="input" value={filters.densityMin || ''} onChange={e=>handleChange('densityMin', e.target.value)} placeholder="Mín."/><input type="text" className="input" value={filters.densityMax || ''} onChange={e=>handleChange('densityMax', e.target.value)} placeholder="Máx."/></div></div><div className="form-group"><label className="label">Fabricante</label><input type="text" className="input" value={filters.manufacturer || ''} onChange={e=>handleChange('manufacturer', e.target.value)} placeholder="Ex: Polibrasil"/></div><div className="modal-actions"><button className="button" onClick={() => {onApply(filters); onClose();}}>Aplicar</button><button className="button" style={{backgroundColor: '#6c757d'}} onClick={() => {onClear(); onClose();}}>Limpar</button></div></div></div>
  );
};

const ProductFormModal = ({ show, onClose, product, onSave }) => {
    const [formData, setFormData] = useState({});
    useEffect(() => { setFormData(product || { tipo: '', refAntiga: {}, refImportada: {} }); }, [product, show]);
    if (!show) return null;
    const handleChange = (e, section, field) => {
        const { name, value } = e.target;
        if (section) setFormData(prev => ({ ...prev, [section]: { ...prev[section], [field]: value } }));
        else setFormData(prev => ({ ...prev, [name]: value }));
    };
    return (
        <div className="modal-overlay"><div className="modal-content"><h2 className="modal-title">{product ? 'Editar Produto' : 'Adicionar Produto'}</h2><div className="form-grid"><div className="form-group"><label className="label">Produto</label><input name="produto" className="input" value={formData.produto || ''} onChange={handleChange}/></div><div className="form-group"><label className="label">Tipo</label><input name="tipo" className="input" value={formData.tipo || ''} onChange={handleChange}/></div><div className="form-group"><label className="label">Índice de Fluidez</label><input name="indiceFluidez" className="input" value={formData.indiceFluidez || ''} onChange={handleChange}/></div><div className="form-group"><label className="label">Densidade</label><input name="densidade" className="input" value={formData.densidade || ''} onChange={handleChange}/></div><div className="form-group"><label className="label">% Talco</label><input name="talco" className="input" value={formData.talco || ''} onChange={handleChange}/></div><div className="form-group"><label className="label">% VA (EVA)</label><input name="va" className="input" value={formData.va || ''} onChange={handleChange}/></div><div className="form-group-full"><label className="label">Aplicação</label><input name="aplicacao" className="input" value={formData.aplicacao || ''} onChange={handleChange}/></div></div><h3 className="product-section-title">Referência Antiga</h3><div className="form-grid"><div className="form-group"><label className="label">Produto</label><input className="input" value={formData.refAntiga?.produto || ''} onChange={e => handleChange(e, 'refAntiga', 'produto')}/></div><div className="form-group"><label className="label">Fabricante</label><input className="input" value={formData.refAntiga?.fabricante || ''} onChange={e => handleChange(e, 'refAntiga', 'fabricante')}/></div></div><h3 className="product-section-title">Referência Importada</h3><div className="form-grid"><div className="form-group"><label className="label">Produto</label><input className="input" value={formData.refImportada?.produto || ''} onChange={e => handleChange(e, 'refImportada', 'produto')}/></div><div className="form-group"><label className="label">Fabricante</label><input className="input" value={formData.refImportada?.fabricante || ''} onChange={e => handleChange(e, 'refImportada', 'fabricante')}/></div></div><div className="form-group-full"><label className="label">Observações</label><textarea name="observacoes" className="input" style={{height: '80px', paddingTop: '0.75rem'}} value={formData.observacoes || ''} onChange={handleChange}/></div><div className="modal-actions"><button className="button" onClick={() => {onSave(formData); onClose();}}>Salvar</button><button className="button" style={{backgroundColor: '#6c757d'}} onClick={onClose}>Cancelar</button></div></div></div>
    );
};


const ProductItem = ({ product, onEdit, onDelete }) => (
  <div className="product-container">
    <div className="product-actions">
      <button className="action-button" onClick={() => onEdit(product)} title="Editar">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V12h2.293l6.5-6.5z"/></svg>
      </button>
      <button className="action-button delete" onClick={() => onDelete(product.id)} title="Excluir">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/><path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/></svg>
      </button>
    </div>
    <div className="product-header"><div><p className="product-name">{product.produto}</p><p className="product-type">{product.tipo}</p></div></div>
    <p className="product-section-title">Propriedades</p>
    <div className="details-grid">
        <div className="detail-item"><span className="detail-label">Índice de Fluidez</span><p className="detail-value">{product.indiceFluidez || 'N/A'}</p></div>
        <div className="detail-item"><span className="detail-label">Densidade</span><p className="detail-value">{product.densidade || 'N/A'}</p></div>
    </div>
    {(product.talco || product.va) && <><p className="product-section-title">Composição</p><div className="details-grid">
        {product.talco && <div className="detail-item"><span className="detail-label">% Talco</span><p className="detail-value">{product.talco}</p></div>}
        {product.va && <div className="detail-item"><span className="detail-label">% VA (EVA)</span><p className="detail-value">{product.va}</p></div>}
    </div></>}
    {product.aplicacao && <><p className="product-section-title">Aplicação</p><p className="product-application">{product.aplicacao}</p></>}
    {product.refAntiga?.produto && <><p className="product-section-title">Referência Antiga</p><div className="reference-container"><p className="reference-text">Produto: {product.refAntiga.produto}</p><p className="reference-text">Fabricante: {product.refAntiga.fabricante}</p></div></>}
    {product.refImportada?.produto && <><p className="product-section-title">Referência Importada</p><div className="reference-container"><p className="reference-text">Produto: {product.refImportada.produto}</p><p className="reference-text">Fabricante: {product.refImportada.fabricante}</p></div></>}
    {product.observacoes && <><p className="product-section-title">Observações</p><p className="product-application">{product.observacoes}</p></>}
  </div>
);

const ProductCatalog = ({ onForceImport }) => {
  const [allProducts, setAllProducts] = useState([]);
  const [productTypes, setProductTypes] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [filters, setFilters] = useState({ type: '', fluidityMin: '', fluidityMax: '', densityMin: '', densityMax: '', manufacturer: '' });
  const [isFilterModalVisible, setFilterModalVisible] = useState(false);
  const [isFormModalVisible, setFormModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "products"), (snapshot) => {
        const productsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setAllProducts(productsData);
        if (productsData.length > 0) {
            const types = [...new Set(productsData.map(p => p.tipo).filter(Boolean))];
            types.sort();
            setProductTypes(types);
        }
        setIsDataLoaded(true);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    let result = [...allProducts];
    const parseNum = (str) => parseFloat(String(str).replace(',', '.'));
    if (searchText) {
      const lowercasedSearch = searchText.toLowerCase();
      result = result.filter(p => Object.values(p).some(val => String(val).toLowerCase().includes(lowercasedSearch)) || (p.refAntiga && Object.values(p.refAntiga).some(val => String(val).toLowerCase().includes(lowercasedSearch))) || (p.refImportada && Object.values(p.refImportada).some(val => String(val).toLowerCase().includes(lowercasedSearch))));
    }
    if (filters.type) result = result.filter(p => p.tipo === filters.type);
    if (filters.manufacturer) {
        const lowercasedManu = filters.manufacturer.toLowerCase();
        result = result.filter(p => String(p.refAntiga?.fabricante).toLowerCase().includes(lowercasedManu) || String(p.refImportada?.fabricante).toLowerCase().includes(lowercasedManu));
    }
    const minF = parseNum(filters.fluidityMin), maxF = parseNum(filters.fluidityMax);
    const minD = parseNum(filters.densityMin), maxD = parseNum(filters.densityMax);
    if (!isNaN(minF)) result = result.filter(p => { const val = parseNum(p.indiceFluidez); return !isNaN(val) && val >= minF; });
    if (!isNaN(maxF)) result = result.filter(p => { const val = parseNum(p.indiceFluidez); return !isNaN(val) && val <= maxF; });
    if (!isNaN(minD)) result = result.filter(p => { const val = parseNum(p.densidade); return !isNaN(val) && val >= minD; });
    if (!isNaN(maxD)) result = result.filter(p => { const val = parseNum(p.densidade); return !isNaN(val) && val <= maxD; });
    setFilteredProducts(result);
  }, [searchText, filters, allProducts]);
  
  const handleSaveProduct = async (productData) => {
      if (productData.id) {
          const { id, ...dataToUpdate } = productData;
          await updateDoc(doc(db, "products", id), dataToUpdate);
      } else {
          await addDoc(collection(db, "products"), productData);
      }
  };

  const handleDeleteProduct = async (id) => {
      if (window.confirm("Tem a certeza que deseja excluir este produto?")) {
          await deleteDoc(doc(db, "products", id));
      }
  };
  
  const handleOpenForm = (product = null) => {
    setEditingProduct(product);
    setFormModalVisible(true);
  };

  if (isDataLoaded && allProducts.length === 0) {
      return (
          <div className="app-container">
               <header className="header"><h1 className="header-title">Catálogo de Produtos</h1><button className="button logout-button" onClick={() => signOut(auth)} title="Sair">Sair</button></header>
               <div className="uploader-container">
                  <div className="uploader-box">
                      <h2 className="modal-title">Nenhum Produto Encontrado</h2>
                      <p style={{color: '#6c757d', marginBottom: '30px'}}>A sua base de dados está vazia. Clique abaixo para importar os dados do seu ficheiro CSV.</p>
                      <button onClick={onForceImport} className="file-input-label">
                          Forçar Importação de Ficheiro
                      </button>
                  </div>
              </div>
          </div>
      );
  }

  return (
    <div className="app-container">
      <FilterModal show={isFilterModalVisible} onClose={() => setFilterModalVisible(false)} onApply={setFilters} onClear={() => setFilters({ type: '', fluidityMin: '', fluidityMax: '', densityMin: '', densityMax: '', manufacturer: '' })} currentFilters={filters} productTypes={productTypes} />
      <ProductFormModal show={isFormModalVisible} onClose={() => setFormModalVisible(false)} product={editingProduct} onSave={handleSaveProduct} />
      <header className="header"><h1 className="header-title">Catálogo de Produtos</h1><button className="button logout-button" onClick={() => signOut(auth)} title="Sair">Sair</button></header>
      <div className="search-section">
        <input className="input" type="text" placeholder="Procurar..." value={searchText} onChange={(e) => setSearchText(e.target.value)}/>
        <div className="button-group">
          <button className="button" onClick={() => setFilterModalVisible(true)}>Filtrar</button>
          <button className="button" style={{backgroundColor: '#28a745'}} onClick={() => handleOpenForm(null)}>Adicionar</button>
        </div>
      </div>
      <main className="product-list">{filteredProducts.length > 0 ? filteredProducts.map(p => <ProductItem key={p.id} product={p} onEdit={handleOpenForm} onDelete={handleDeleteProduct} />) : <div className="no-products-container"><p className="no-products-text">A carregar produtos...</p></div>}</main>
    </div>
  );
}

export default function App() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showUploader, setShowUploader] = useState(false);

    const checkDatabase = useCallback(async () => {
        const productsRef = collection(db, "products");
        const q = query(productsRef, limit(1));
        const snapshot = await getDocs(q);
        if (snapshot.empty) {
            setShowUploader(true);
        } else {
            setShowUploader(false);
        }
        setLoading(false);
    }, []);

    const handleLogin = useCallback((loggedInUser) => {
        setUser(loggedInUser);
        checkDatabase();
    }, [checkDatabase]);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                handleLogin(currentUser);
            } else {
                setUser(null);
                setLoading(false);
            }
        });
        return () => unsubscribe();
    }, [handleLogin]);
    
    const forceImport = () => {
        setShowUploader(true);
    };

    if (loading) {
        return <div className="loading-screen">A verificar...</div>;
    }

    if (!user) {
        return <LoginScreen onLogin={handleLogin} />;
    }

    if (showUploader) {
        return <DataUploader onUploadComplete={checkDatabase} />;
    }

    return (
        <>
            <StyleInjector />
            <ProductCatalog onForceImport={forceImport} />
        </>
    );
}
