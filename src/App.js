import React, { useState, useEffect } from 'react';
// Importações do Firebase
import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { getFirestore, collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, getDocs, query, limit, writeBatch } from "firebase/firestore";
// Importação da biblioteca para ler ficheiros CSV
import Papa from 'papaparse';

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
  loadingScreen: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'white', fontSize: '18px' },
  uploaderContainer: { display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'white', textAlign: 'center', padding: '20px' },
  uploaderBox: { backgroundColor: '#2c2c2e', padding: '40px', borderRadius: '12px', boxShadow: '0 5px 15px rgba(0,0,0,0.5)'},
  fileInput: { display: 'none' },
  fileInputLabel: { backgroundColor: '#007AFF', color: 'white', padding: '15px 30px', borderRadius: '8px', cursor: 'pointer', display: 'inline-block', marginBottom: '20px' },
  progressText: { marginTop: '20px', fontSize: '16px' }
};

// --- Componentes ---

const LoginScreen = ({ onLogin }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleAuth = async () => {
        setError('');
        try {
            let userCredential;
            if (isLogin) {
                userCredential = await signInWithEmailAndPassword(auth, email, password);
            } else {
                userCredential = await createUserWithEmailAndPassword(auth, email, password);
            }
            onLogin(userCredential.user);
        } catch (err) {
            if (err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') setError('Email ou senha inválidos.');
            else if (err.code === 'auth/email-already-in-use') setError('Este email já está cadastrado.');
            else setError('Ocorreu um erro. Tente novamente.');
        }
    };

    return (
        <div style={styles.loginContainer}><div style={styles.loginBox}><h2 style={styles.loginTitle}>{isLogin ? 'Login' : 'Cadastro'}</h2>{error && <p style={styles.loginError}>{error}</p>}<div style={styles.formGroup}><input type="email" placeholder="Email" style={styles.modalInput} value={email} onChange={e => setEmail(e.target.value)} /></div><div style={styles.formGroup}><input type="password" placeholder="Senha" style={styles.modalInput} value={password} onChange={e => setPassword(e.target.value)} /></div><button style={{...styles.modalButton, ...styles.applyButton, width: '100%'}} onClick={handleAuth}>{isLogin ? 'Entrar' : 'Cadastrar'}</button><p style={styles.loginToggle} onClick={() => setIsLogin(!isLogin)}>{isLogin ? 'Não tem uma conta? Cadastre-se' : 'Já tem uma conta? Faça o login'}</p></div></div>
    );
};

const DataUploader = ({ onUploadComplete }) => {
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState('');

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setUploading(true);
        setProgress('A ler o ficheiro...');

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: async (results) => {
                const products = results.data;
                const total = products.length;
                setProgress(`A preparar para enviar ${total} produtos...`);

                const productsRef = collection(db, "products");
                const batch = writeBatch(db);
                
                products.forEach((product, index) => {
                    const newProductRef = doc(productsRef);
                    const formattedProduct = {
                        produto: product.Produto || '',
                        tipo: product.Tipo || '',
                        indiceFluidez: product['Índice de Fluidez'] || '',
                        densidade: product.Densidade || '',
                        aplicacao: product.Aplicação || '',
                        refAntiga: {
                            produto: product.RefAntiga_produto || '',
                            fabricante: product.RefAntiga_fabricante || '',
                            fluidez: product.RefAntiga_fluidez || ''
                        },
                        refImportada: {
                            produto: product.RefImportada_produto || '',
                            indiceFluidez: product.RefImportada_indiceFluidez || '',
                            densidade: product.RefImportada_densidade || '',
                            fabricante: product.RefImportada_fabricante || ''
                        },
                        talco: product['% Talco'] || '',
                        va: product['% VA (EVA)'] || '',
                        observacoes: product.Observações || ''
                    };
                    batch.set(newProductRef, formattedProduct);
                });

                try {
                    await batch.commit();
                    setProgress('Importação concluída com sucesso! A carregar o catálogo...');
                    setTimeout(() => {
                        onUploadComplete();
                    }, 2000);
                } catch (error) {
                    console.error("Erro ao enviar dados em massa: ", error);
                    setProgress('Erro ao importar. Verifique as regras do Firestore e tente novamente.');
                    setUploading(false);
                }
            }
        });
    };

    return (
        <div style={styles.uploaderContainer}>
            <div style={styles.uploaderBox}>
                <h2 style={styles.modalTitle}>Importar Base de Dados</h2>
                <p style={{color: '#ccc', marginBottom: '30px'}}>A sua base de dados está vazia. Por favor, carregue o ficheiro CSV para popular o catálogo.</p>
                <label htmlFor="csv-upload" style={styles.fileInputLabel}>
                    {uploading ? 'A processar...' : 'Escolher Ficheiro CSV'}
                </label>
                <input id="csv-upload" type="file" accept=".csv" style={styles.fileInput} onChange={handleFileUpload} disabled={uploading} />
                {progress && <p style={styles.progressText}>{progress}</p>}
            </div>
        </div>
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

const ProductCatalog = ({ onForceRefresh }) => {
  const [allProducts, setAllProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [filters, setFilters] = useState({ type: '', fluidityMin: '', fluidityMax: '', densityMin: '', densityMax: '', manufacturer: '' });
  const [isFilterModalVisible, setFilterModalVisible] = useState(false);
  const [isFormModalVisible, setFormModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  useEffect(() => {
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

  return (
    <div style={styles.container}>
      {/* Modals e Header não precisam de alterações */}
      <header style={styles.header}><h1 style={styles.headerTitle}>Catálogo de Produtos</h1><button style={styles.logoutButton} onClick={() => signOut(auth)} title="Sair"><span style={styles.buttonText}>Sair</span></button></header>
      <div style={styles.searchSection}><input style={styles.input} type="text" placeholder="Procurar..." value={searchText} onChange={(e) => setSearchText(e.target.value)}/><button style={styles.filterButton} onClick={() => setFilterModalVisible(true)}><span style={styles.buttonText}>Filtrar</span></button><button style={styles.addButton} onClick={() => handleOpenForm(null)}><span style={styles.buttonText}>Adicionar</span></button></div>
      <main style={styles.productList}>{filteredProducts.length > 0 ? filteredProducts.map(p => <ProductItem key={p.id} product={p} onEdit={handleOpenForm} onDelete={handleDeleteProduct} />) : <div style={styles.noProductsContainer}><p style={styles.noProductsText}>Nenhum produto encontrado.</p></div>}</main>
    </div>
  );
}

export default function App() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isDbEmpty, setIsDbEmpty] = useState(false);
    const [checkDone, setCheckDone] = useState(false);

    const checkDatabase = async () => {
        const productsRef = collection(db, "products");
        const q = query(productsRef, limit(1));
        const snapshot = await getDocs(q);
        setIsDbEmpty(snapshot.empty);
        setCheckDone(true);
    };

    const handleLogin = (loggedInUser) => {
        setUser(loggedInUser);
        checkDatabase();
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                handleLogin(currentUser);
            } else {
                setUser(null);
                setCheckDone(true);
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    if (loading || !checkDone) {
        return <div style={styles.loadingScreen}>A verificar...</div>;
    }

    if (!user) {
        return <LoginScreen onLogin={handleLogin} />;
    }

    if (isDbEmpty) {
        return <DataUploader onUploadComplete={checkDatabase} />;
    }

    return <ProductCatalog />;
}
