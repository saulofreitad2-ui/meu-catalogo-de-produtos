import React, { useState, useEffect } from 'react';
// Importações do Firebase
import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { getFirestore, collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, getDocs, query, limit } from "firebase/firestore";

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

// --- Dados Iniciais da Planilha para Importação Automática ---
// Estes dados serão carregados no seu banco de dados na primeira execução
const initialData = [
    { produto: "HP 500D", tipo: "PP Homo", indiceFluidez: "0.8", densidade: "", aplicacao: "Extrusão geral (fita de arquear, perfis, chapas e outros)", refAntiga: { produto: "GE 7100", fabricante: "Polibrasil", fluidez: "" }, refImportada: { produto: "GE 6100", indiceFluidez: "0.7", densidade: "", fabricante: "PETROKEN" }, talco: "", va: "", observacoes: "" },
    { produto: "H 603", tipo: "PP Homo", indiceFluidez: "1.5", densidade: "", aplicacao: "Embalagem de ráfia, Extrusão geral (fita de arquear, perfis, chapas e outros), Frascos soprados", refAntiga: { produto: "HP 500G", fabricante: "Quattor", fluidez: "" }, refImportada: { produto: "HY6100", indiceFluidez: "1.8", densidade: "", fabricante: "PETROKEN" }, talco: "", va: "", observacoes: "" },
    { produto: "H 604", tipo: "PP Homo", indiceFluidez: "1.5", densidade: "", aplicacao: "Embalagens termoformadas e descartáveis, Extrusão geral (fita de arquear, perfis, chapas e outros), Frascos soprados", refAntiga: { produto: "HP 640H", fabricante: "Quattor", fluidez: "" }, refImportada: { produto: "", indiceFluidez: "", densidade: "", fabricante: "" }, talco: "", va: "", observacoes: "" },
    { produto: "H 501HC", tipo: "PP Homo", indiceFluidez: "3.5", densidade: "", aplicacao: "Embalagens termoformadas e descartáveis", refAntiga: { produto: "HA 722J", fabricante: "Polibrasil", fluidez: "" }, refImportada: { produto: "500P", indiceFluidez: "3", densidade: "", fabricante: "SABIC" }, talco: "", va: "", observacoes: "" },
    { produto: "H 503HS", tipo: "PP Homo", indiceFluidez: "4", densidade: "", aplicacao: "Embalagem de ráfia", refAntiga: { produto: "HP 550K", fabricante: "Quattor", fluidez: "" }, refImportada: { produto: "H-030SG", indiceFluidez: "3.4", densidade: "", fabricante: "RELIANCE" }, talco: "", va: "", observacoes: "" },
    { produto: "CP 241", tipo: "PP Copo", indiceFluidez: "25", densidade: "", aplicacao: "Peças de parede fina, Utilidades domésticas", refAntiga: { produto: "CP 200HC", fabricante: "Quattor", fluidez: "" }, refImportada: { produto: "Moplen 3830", indiceFluidez: "25", densidade: "", fabricante: "RELIANCE" }, talco: "", va: "", observacoes: "" },
    { produto: "EP 440L", tipo: "PP Copo", indiceFluidez: "1.7", densidade: "", aplicacao: "Termoformagem, Extrusão de chapas", refAntiga: { produto: "EP 440L", fabricante: "Polibrasil", fluidez: "" }, refImportada: { produto: "RP 225M", indiceFluidez: "1.7", densidade: "", fabricante: "RELIANCE" }, talco: "", va: "", observacoes: "" },
    { produto: "SM 350", tipo: "PP Raco", indiceFluidez: "35", densidade: "", aplicacao: "Utilidades domésticas, Peças automotivas, Eletrodomésticos", refAntiga: { produto: "SM 350", fabricante: "Braskem", fluidez: "" }, refImportada: { produto: "4100N", indiceFluidez: "35", densidade: "", fabricante: "REPSOL" }, talco: "", va: "", observacoes: "" },
    { produto: "U 249", tipo: "PS", indiceFluidez: "19", densidade: "", aplicacao: "Brinquedos, Utilidade Doméstica, Artigos escolares, Cabides", refAntiga: { produto: "145 D", fabricante: "", fluidez: "" }, refImportada: { produto: "N 1821", indiceFluidez: "20", densidade: "", fabricante: "Videolar" }, talco: "", va: "", observacoes: "Antigo N 2380" }
];


// --- Estilos ---
const styles = {
  safeArea: { backgroundColor: '#1a1a1a', fontFamily: 'sans-serif' },
  container: { display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#1a1a1a' },
  header: { backgroundColor: '#252525', padding: '20px 16px', borderBottom: '1px solid #333', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { color: '#fff', fontSize: '24px', fontWeight: 'bold', margin: 0 },
  searchSection: { display: 'flex', flexDirection: 'row', padding: '16px', alignItems: 'center', backgroundColor: '#252525' },
  input: { flex: 1, height: '50px', backgroundColor: '#333', borderRadius: '8px', padding: '0 16px', color: '#fff', fontSize: '16px', marginRight: '10px', border: 'none' },
  filterButton: { height: '50px', backgroundColor: '#007AFF', borderRadius: '8px', padding: '0 20px', display: 'flex', justifyContent: 'center', alignItems: 'center', border: 'none', cursor: 'pointer' },
  addButton: { height: '50px', backgroundColor: '#4CAF50', borderRadius: '8px', padding: '0 20px', display: 'flex', justifyContent: 'center', alignItems: 'center', border: 'none', cursor: 'pointer', marginLeft: '10px' },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: '16px' },
  logoutButton: { backgroundColor: '#f44336', padding: '10px 15px', borderRadius: '8px', border: 'none', cursor: 'pointer' },
  productList: { flex: 1, padding: '16px', overflowY: 'auto' },
  productContainer: { backgroundColor: '#2c2c2e', padding: '20px', borderRadius: '12px', marginBottom: '16px', boxShadow: '0 2px 4px rgba(0,0,0,0.3)', position: 'relative' },
  productActions: { position: 'absolute', top: '15px', right: '15px', display: 'flex', gap: '10px' },
  actionButton: { backgroundColor: '#555', padding: '8px', borderRadius: '50%', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  productHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px', borderBottom: '1px solid #444', paddingBottom: '10px' },
  productName: { fontSize: '20px', fontWeight: 'bold', color: '#fff', margin: 0 },
  productType: { fontSize: '14px', color: '#aaa', fontStyle: 'italic' },
  productSectionTitle: { fontSize: '16px', fontWeight: 'bold', color: '#00AFFF', marginTop: '16px', marginBottom: '8px', borderBottom: '1px solid #444', paddingBottom: '4px' },
  productApplication: { fontSize: '14px', color: '#ccc', lineHeight: '1.5' },
  referenceContainer: { backgroundColor: '#3a3a3c', borderRadius: '8px', padding: '12px', marginTop: '10px' },
  referenceText: { fontSize: '14px', color: '#ddd', margin: '4px 0' },
  detailsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '10px' },
  detailItem: { backgroundColor: '#3a3a3c', padding: '8px', borderRadius: '6px' },
  detailLabel: { fontSize: '12px', color: '#aaa' },
  detailValue: { fontSize: '14px', color: '#fff', fontWeight: '500' },
  noProductsContainer: { flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '50px' },
  noProductsText: { color: '#888', fontSize: '16px' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
  modalContent: { backgroundColor: '#2c2c2e', padding: '30px', borderRadius: '12px', width: '90%', maxWidth: '600px', color: '#fff', maxHeight: '90vh', overflowY: 'auto' },
  modalTitle: { fontSize: '22px', fontWeight: 'bold', marginBottom: '20px', textAlign: 'center' },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' },
  formGroup: { marginBottom: '15px' },
  formGroupFull: { gridColumn: '1 / -1' },
  label: { display: 'block', marginBottom: '8px', fontSize: '16px', color: '#ccc' },
  modalInput: { width: '100%', padding: '12px', backgroundColor: '#333', border: '1px solid #555', borderRadius: '8px', color: '#fff', fontSize: '16px', boxSizing: 'border-box' },
  modalSelect: { width: '100%', padding: '12px', backgroundColor: '#333', border: '1px solid #555', borderRadius: '8px', color: '#fff', fontSize: '16px' },
  rangeContainer: { display: 'flex', alignItems: 'center', gap: '10px' },
  modalActions: { display: 'flex', justifyContent: 'space-between', marginTop: '30px' },
  modalButton: { flex: 1, padding: '12px 20px', borderRadius: '8px', border: 'none', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' },
  applyButton: { backgroundColor: '#007AFF', color: 'white', marginRight: '10px' },
  clearButton: { backgroundColor: '#555', color: 'white' },
  loginContainer: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' },
  loginBox: { width: '350px', padding: '40px', backgroundColor: '#2c2c2e', borderRadius: '12px', boxShadow: '0 5px 15px rgba(0,0,0,0.5)' },
  loginTitle: { color: '#fff', textAlign: 'center', marginBottom: '30px' },
  loginError: { color: '#f44336', textAlign: 'center', marginBottom: '15px' },
  loginToggle: { color: '#007AFF', textAlign: 'center', cursor: 'pointer', marginTop: '20px' },
  loadingScreen: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'white', fontSize: '18px' }
};

// --- Componentes ---

const LoginScreen = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleAuth = async () => {
        setError('');
        try {
            if (isLogin) await signInWithEmailAndPassword(auth, email, password);
            else await createUserWithEmailAndPassword(auth, email, password);
        } catch (err) {
            if (err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') setError('Email ou senha inválidos.');
            else if (err.code === 'auth/email-already-in-use') setError('Este email já está cadastrado.');
            else setError('Ocorreu um erro. Tente novamente.');
        }
    };

    return (
        <div style={styles.loginContainer}><div style={styles.loginBox}><h2 style={styles.loginTitle}>{isLogin ? 'Login' : 'Cadastro'}</h2>{error && <p style={styles.loginError}>{error}</p>}<div style={styles.formGroup}><input type="email" placeholder="Email" style={styles.modalInput} value={email} onChange={e => setEmail(e.target.value)} /></div><div style={styles.formGroup}><input type="password" placeholder="Senha" style={styles.modalInput} value={password} onChange={e => setPassword(e.target.value)} /></div><button style={{...styles.modalButton, ...styles.applyButton, width: '100%'}} onClick={handleAuth}>{isLogin ? 'Entrar' : 'Cadastrar'}</button><p style={styles.loginToggle} onClick={() => setIsLogin(!isLogin)}>{isLogin ? 'Não tem uma conta? Cadastre-se' : 'Já tem uma conta? Faça o login'}</p></div></div>
    );
};

const FilterModal = ({ show, onClose, onApply, onClear, currentFilters }) => {
  const [filters, setFiltersState] = useState(currentFilters);
  useEffect(() => { setFiltersState(currentFilters); }, [currentFilters, show]);
  if (!show) return null;
  const handleChange = (field, value) => setFiltersState(prev => ({...prev, [field]: value}));
  return (
    <div style={styles.modalOverlay}><div style={styles.modalContent}><h2 style={styles.modalTitle}>Filtros Avançados</h2><div style={styles.formGroup}><label style={styles.label}>Tipo</label><select style={styles.modalSelect} value={filters.type} onChange={e=>handleChange('type', e.target.value)}><option value="">Todos</option><option value="PP Homo">PP Homo</option><option value="PP Copo">PP Copo</option><option value="PP Raco">PP Raco</option><option value="PS">PS</option></select></div><div style={styles.formGroup}><label style={styles.label}>Faixa de Fluidez</label><div style={styles.rangeContainer}><input type="text" style={styles.modalInput} value={filters.fluidityMin} onChange={e=>handleChange('fluidityMin', e.target.value)} placeholder="Mín."/><input type="text" style={styles.modalInput} value={filters.fluidityMax} onChange={e=>handleChange('fluidityMax', e.target.value)} placeholder="Máx."/></div></div><div style={styles.formGroup}><label style={styles.label}>Faixa de Densidade</label><div style={styles.rangeContainer}><input type="text" style={styles.modalInput} value={filters.densityMin} onChange={e=>handleChange('densityMin', e.target.value)} placeholder="Mín."/><input type="text" style={styles.modalInput} value={filters.densityMax} onChange={e=>handleChange('densityMax', e.target.value)} placeholder="Máx."/></div></div><div style={styles.formGroup}><label style={styles.label}>Fabricante</label><input type="text" style={styles.modalInput} value={filters.manufacturer} onChange={e=>handleChange('manufacturer', e.target.value)} placeholder="Ex: Polibrasil"/></div><div style={styles.modalActions}><button style={{...styles.modalButton, ...styles.applyButton}} onClick={() => {onApply(filters); onClose();}}>Aplicar</button><button style={{...styles.modalButton, ...styles.clearButton}} onClick={() => {onClear(); onClose();}}>Limpar</button></div></div></div>
  );
};

const ProductFormModal = ({ show, onClose, product, onSave }) => {
    const [formData, setFormData] = useState({});
    useEffect(() => { setFormData(product || { tipo: 'PP Homo', refAntiga: {}, refImportada: {} }); }, [product, show]);
    if (!show) return null;
    const handleChange = (e, section, field) => {
        const { name, value } = e.target;
        if (section) setFormData(prev => ({ ...prev, [section]: { ...prev[section], [field]: value } }));
        else setFormData(prev => ({ ...prev, [name]: value }));
    };
    return (
        <div style={styles.modalOverlay}><div style={styles.modalContent}><h2 style={styles.modalTitle}>{product ? 'Editar Produto' : 'Adicionar Produto'}</h2><div style={styles.formGrid}><div style={styles.formGroup}><label style={styles.label}>Produto</label><input name="produto" style={styles.modalInput} value={formData.produto || ''} onChange={handleChange}/></div><div style={styles.formGroup}><label style={styles.label}>Tipo</label><input name="tipo" style={styles.modalInput} value={formData.tipo || ''} onChange={handleChange}/></div><div style={styles.formGroup}><label style={styles.label}>Índice de Fluidez</label><input name="indiceFluidez" style={styles.modalInput} value={formData.indiceFluidez || ''} onChange={handleChange}/></div><div style={styles.formGroup}><label style={styles.label}>Densidade</label><input name="densidade" style={styles.modalInput} value={formData.densidade || ''} onChange={handleChange}/></div><div style={styles.formGroup}><label style={styles.label}>% Talco</label><input name="talco" style={styles.modalInput} value={formData.talco || ''} onChange={handleChange}/></div><div style={styles.formGroup}><label style={styles.label}>% VA (EVA)</label><input name="va" style={styles.modalInput} value={formData.va || ''} onChange={handleChange}/></div><div style={{...styles.formGroup, ...styles.formGroupFull}}><label style={styles.label}>Aplicação</label><input name="aplicacao" style={styles.modalInput} value={formData.aplicacao || ''} onChange={handleChange}/></div></div><h3 style={styles.productSectionTitle}>Referência Antiga</h3><div style={styles.formGrid}><div style={styles.formGroup}><label style={styles.label}>Produto</label><input style={styles.modalInput} value={formData.refAntiga?.produto || ''} onChange={e => handleChange(e, 'refAntiga', 'produto')}/></div><div style={styles.formGroup}><label style={styles.label}>Fabricante</label><input style={styles.modalInput} value={formData.refAntiga?.fabricante || ''} onChange={e => handleChange(e, 'refAntiga', 'fabricante')}/></div></div><h3 style={styles.productSectionTitle}>Referência Importada</h3><div style={styles.formGrid}><div style={styles.formGroup}><label style={styles.label}>Produto</label><input style={styles.modalInput} value={formData.refImportada?.produto || ''} onChange={e => handleChange(e, 'refImportada', 'produto')}/></div><div style={styles.formGroup}><label style={styles.label}>Fabricante</label><input style={styles.modalInput} value={formData.refImportada?.fabricante || ''} onChange={e => handleChange(e, 'refImportada', 'fabricante')}/></div></div><div style={{...styles.formGroup, ...styles.formGroupFull}}><label style={styles.label}>Observações</label><textarea name="observacoes" style={styles.modalInput} value={formData.observacoes || ''} onChange={handleChange}/></div><div style={styles.modalActions}><button style={{...styles.modalButton, ...styles.applyButton}} onClick={() => {onSave(formData); onClose();}}>Salvar</button><button style={{...styles.modalButton, ...styles.clearButton}} onClick={onClose}>Cancelar</button></div></div></div>
    );
};

const ProductItem = ({ product, onEdit, onDelete }) => (
  <div style={styles.productContainer}>
    <div style={styles.productActions}><button style={styles.actionButton} onClick={() => onEdit(product)} title="Editar">✏️</button><button style={{...styles.actionButton, backgroundColor: '#f44336'}} onClick={() => onDelete(product.id)} title="Excluir">🗑️</button></div>
    <div style={styles.productHeader}><div><p style={styles.productName}>{product.produto}</p><p style={styles.productType}>{product.tipo}</p></div></div>
    <p style={styles.productSectionTitle}>Propriedades</p>
    <div style={styles.detailsGrid}>
        <div style={styles.detailItem}><span style={styles.detailLabel}>Índice de Fluidez</span><p style={styles.detailValue}>{product.indiceFluidez || 'N/A'}</p></div>
        <div style={styles.detailItem}><span style={styles.detailLabel}>Densidade</span><p style={styles.detailValue}>{product.densidade || 'N/A'}</p></div>
    </div>
    {(product.talco || product.va) && <><p style={styles.productSectionTitle}>Composição</p><div style={styles.detailsGrid}>
        {product.talco && <div style={styles.detailItem}><span style={styles.detailLabel}>% Talco</span><p style={styles.detailValue}>{product.talco}</p></div>}
        {product.va && <div style={styles.detailItem}><span style={styles.detailLabel}>% VA (EVA)</span><p style={styles.detailValue}>{product.va}</p></div>}
    </div></>}
    <p style={styles.productSectionTitle}>Aplicação</p><p style={styles.productApplication}>{product.aplicacao}</p>
    {product.refAntiga?.produto && <><p style={styles.productSectionTitle}>Referência Antiga</p><div style={styles.referenceContainer}><p style={styles.referenceText}>Produto: {product.refAntiga.produto}</p><p style={styles.referenceText}>Fabricante: {product.refAntiga.fabricante}</p></div></>}
    {product.refImportada?.produto && <><p style={styles.productSectionTitle}>Referência Importada</p><div style={styles.referenceContainer}><p style={styles.referenceText}>Produto: {product.refImportada.produto}</p><p style={styles.referenceText}>Fabricante: {product.refImportada.fabricante}</p></div></>}
    {product.observacoes && <><p style={styles.productSectionTitle}>Observações</p><p style={styles.productApplication}>{product.observacoes}</p></>}
  </div>
);

const ProductCatalog = () => {
  const [allProducts, setAllProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [filters, setFilters] = useState({ type: '', fluidityMin: '', fluidityMax: '', densityMin: '', densityMax: '', manufacturer: '' });
  const [isFilterModalVisible, setFilterModalVisible] = useState(false);
  const [isFormModalVisible, setFormModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState('Carregando produtos...');

  useEffect(() => {
    const checkAndPopulate = async () => {
        const productsRef = collection(db, "products");
        const q = query(productsRef, limit(1));
        const snapshot = await getDocs(q);
        if (snapshot.empty) {
            setLoadingMessage("Banco de dados vazio. Populando com dados iniciais, por favor aguarde...");
            for (const product of initialData) {
                await addDoc(productsRef, product);
            }
        }
        setIsLoading(false);
        setLoadingMessage('');
    };
    checkAndPopulate();

    const unsubscribe = onSnapshot(collection(db, "products"), (snapshot) => {
        const productsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setAllProducts(productsData);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    let result = [...allProducts];
    const parseNum = (str) => parseFloat(String(str).replace(',', '.'));
    if (searchText) {
      const lowercasedSearch = searchText.toLowerCase();
      result = result.filter(p => Object.values(p).some(val => String(val).toLowerCase().includes(lowercasedSearch)) || Object.values(p.refAntiga).some(val => String(val).toLowerCase().includes(lowercasedSearch)) || Object.values(p.refImportada).some(val => String(val).toLowerCase().includes(lowercasedSearch)));
    }
    if (filters.type) result = result.filter(p => p.tipo === filters.type);
    if (filters.manufacturer) {
        const lowercasedManu = filters.manufacturer.toLowerCase();
        result = result.filter(p => String(p.refAntiga?.fabricante).toLowerCase().includes(lowercasedManu) || String(p.refImportada?.fabricante).toLowerCase().includes(lowercasedManu));
    }
    const minF = parseNum(filters.fluidityMin), maxF = parseNum(filters.fluidityMax);
    const minD = parseNum(filters.densityMin), maxD = parseNum(filters.densityMax);
    if (!isNaN(minF)) result = result.filter(p => parseNum(p.indiceFluidez) >= minF);
    if (!isNaN(maxF)) result = result.filter(p => parseNum(p.indiceFluidez) <= maxF);
    if (!isNaN(minD)) result = result.filter(p => parseNum(p.densidade) >= minD);
    if (!isNaN(maxD)) result = result.filter(p => parseNum(p.densidade) <= maxD);
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
      if (window.confirm("Tem certeza que deseja excluir este produto?")) {
          await deleteDoc(doc(db, "products", id));
      }
  };

  if (isLoading) return <div style={styles.loadingScreen}>{loadingMessage}</div>;

  return (
    <div style={styles.container}>
      <FilterModal show={isFilterModalVisible} onClose={() => setFilterModalVisible(false)} onApply={setFilters} onClear={() => setFilters({})} currentFilters={filters}/>
      <ProductFormModal show={isFormModalVisible} onClose={() => setFormModalVisible(false)} product={editingProduct} onSave={handleSaveProduct} />
      <header style={styles.header}><h1 style={styles.headerTitle}>Catálogo de Produtos</h1><button style={styles.logoutButton} onClick={() => signOut(auth)} title="Sair"><span style={styles.buttonText}>Sair</span></button></header>
      <div style={styles.searchSection}><input style={styles.input} type="text" placeholder="Buscar..." value={searchText} onChange={(e) => setSearchText(e.target.value)}/><button style={styles.filterButton} onClick={() => setFilterModalVisible(true)}><span style={styles.buttonText}>Filtrar</span></button><button style={styles.addButton} onClick={() => {setEditingProduct(null); setFormModalVisible(true);}}><span style={styles.buttonText}>Adicionar</span></button></div>
      <main style={styles.productList}>{filteredProducts.length > 0 ? filteredProducts.map(p => <ProductItem key={p.id} product={p} onEdit={() => {setEditingProduct(p); setFormModalVisible(true);}} onDelete={handleDeleteProduct} />) : <div style={styles.noProductsContainer}><p style={styles.noProductsText}>Nenhum produto encontrado.</p></div>}</main>
    </div>
  );
}

export default function App() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    if (loading) return <div style={styles.loadingScreen}>Verificando autenticação...</div>;
    return user ? <ProductCatalog /> : <LoginScreen />;
}
