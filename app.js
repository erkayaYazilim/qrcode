// Firebase yapılandırması
const firebaseConfig = {
    apiKey: "AIzaSyDg0qFZV7wh6KfocHfw2JRC-Idv8yAaSic",
    authDomain: "whatsapp-156a6.firebaseapp.com",
    databaseURL: "https://whatsapp-156a6-default-rtdb.firebaseio.com",
    projectId: "whatsapp-156a6",
    storageBucket: "whatsapp-156a6.appspot.com",
    messagingSenderId: "236478826016",
    appId: "1:236478826016:web:34a9fa5b51c69f63045e45",
    measurementId: "G-0LY6WH95VM"
  };

// Firebase'i Başlat

// Firebase'i Başlat
firebase.initializeApp(firebaseConfig);
const database = firebase.database();
const storage = firebase.storage();

// Sayfa Yüklenince Başlangıç Fonksiyonu
// Sayfa Yüklenince Başlangıç Fonksiyonu
document.addEventListener('DOMContentLoaded', () => {
    showDashboard();

    // Menü Barı Event Listeners
    document.getElementById('navDashboard').addEventListener('click', showDashboard);
    document.getElementById('navAddProduct').addEventListener('click', () => {
        clearProductForm();
        showAddProductForm();
    });
    document.getElementById('navSettings').addEventListener('click', showSettingsPage);
    document.getElementById('navExcelUpload').addEventListener('click', showExcelUploadPage);

    document.getElementById('navViewAllProducts').addEventListener('click', showAllProductsPage);
    document.getElementById('navPrintLabels').addEventListener('click', showPrintLabelsPage);
    // Arama İşlevi
    document.getElementById('searchInput').addEventListener('input', searchProducts);

    // Excel Dosyası Yükleme Butonu
    document.getElementById('excelFileInput').addEventListener('change', readExcelFile);
    document.getElementById('addMappingBtn').addEventListener('click', addMappingField);
    document.getElementById('uploadExcelBtn').addEventListener('click', handleExcelUpload);

    // Yeni Ürün Ekleme
    document.getElementById('addFeatureBtn').addEventListener('click', addFeature);
    document.getElementById('saveBtn').addEventListener('click', saveProduct);
    document.getElementById('cancelBtn').addEventListener('click', () => {
        clearProductForm();
        showDashboard();
    });

    // Canlı Önizleme Güncellemeleri
    document.getElementById('productName').addEventListener('input', updatePreview);
    document.getElementById('productCode').addEventListener('input', updatePreview);
    document.getElementById('listPrice').addEventListener('input', updatePreview);
    document.getElementById('discountedPrice').addEventListener('input', updatePreview);
    document.getElementById('productDescription').addEventListener('input', updatePreview);
    document.getElementById('productImages').addEventListener('change', updateImagePreview);

    // Etiketi Yazdırma
    document.getElementById('printLabelBtn').addEventListener('click', printLabel);

    // Ayarları Kaydetme
    document.getElementById('saveSettingsBtn').addEventListener('click', saveSettings);

    // Ürünleri Belleğe Yükle (Görünür Listeye Eklemiyoruz)
    loadAllProducts();

    // Toplam ürün sayısını güncelle
    updateTotalProductCount();

    // Ayarları Yükle
    loadSettings();

    // Canlı Önizleme için Ayarları Yükle
    loadSettingsForPreview();

    
});

// Sayfa Gösterim Fonksiyonları
function showDashboard() {
    hideAllSections();
    document.getElementById('dashboard').classList.remove('d-none');
    setActiveNav('navDashboard');
}

function showAddProductForm() {
    hideAllSections();
    document.getElementById('addProductForm').classList.remove('d-none');
    setActiveNav('navAddProduct');
}

function showSettingsPage() {
    hideAllSections();
    document.getElementById('settingsPage').classList.remove('d-none');
    setActiveNav('navSettings');
}

function showExcelUploadPage() {
    hideAllSections();
    document.getElementById('excelUploadPage').classList.remove('d-none');
    setActiveNav('navExcelUpload');
}

function hideAllSections() {
    document.getElementById('dashboard').classList.add('d-none');
    document.getElementById('addProductForm').classList.add('d-none');
    document.getElementById('settingsPage').classList.add('d-none');
    document.getElementById('excelUploadPage').classList.add('d-none');
    document.getElementById('allProductsPage').classList.add('d-none');
}

function setActiveNav(navId) {
    document.querySelectorAll('.navbar .nav-link').forEach(link => {
        link.classList.remove('active');
    });
    document.getElementById(navId).classList.add('active');
}

// Ürün Ekleme İşlemleri
let featureCount = 0;
let isEditing = false;
let editingProductKey = '';
let existingProductData = {};

function clearProductForm() {
    // Form alanlarını sıfırlayın
    document.getElementById('productName').value = '';
    document.getElementById('productLink').value = '';
    document.getElementById('productCode').value = '';
    document.getElementById('listPrice').value = '';
    document.getElementById('discountedPrice').value = '';
    document.getElementById('productDescription').value = '';
    document.getElementById('productImages').value = '';
    // Özellikleri temizleyin
    document.getElementById('featuresContainer').innerHTML = '';
    featureCount = 0;
    // Önizlemeyi sıfırlayın
    document.getElementById('previewCarouselInner').innerHTML = '';
    document.getElementById('previewFeaturesTable').innerHTML = '';
    document.getElementById('previewProductLink').innerHTML = '';
    document.getElementById('previewProductName').textContent = 'Ürün Adı';
    document.getElementById('previewProductPrice').innerHTML =
        '<span id="previewDiscountedPrice">0.00 TL</span> <small class="text-muted"><del id="previewListPrice">0.00 TL</del></small>';
    document.getElementById('previewProductDescription').textContent =
        'Ürün açıklaması burada görünecek.';
    // Durumları sıfırlayın
    isEditing = false;
    editingProductKey = '';
    existingProductData = {};
    document.getElementById('formTitle').textContent = 'Yeni Ürün Oluştur';
    document.getElementById('saveBtn').innerHTML =
        '<i class="bi bi-save me-1"></i> Kaydet ve QR Kod Oluştur';
    document.getElementById('qrcode').innerHTML = '';
    document.getElementById('newProductBtn')?.remove();
    // Etiket önizlemesini sıfırlayın
    document.getElementById('labelProductName').textContent = 'Ürün Adı';
    document.getElementById('labelProductCode').textContent = '12345';
    document.getElementById('labelQRCode').innerHTML = '';
}


function addFeature() {
    featureCount++;
    const featuresContainer = document.getElementById('featuresContainer');
    const featureDiv = document.createElement('div');
    featureDiv.classList.add('feature', 'card', 'p-3', 'mb-3');
    featureDiv.setAttribute('data-feature-id', featureCount);
    featureDiv.innerHTML = `
        <div class="d-flex justify-content-between">
            <h5>Özellik ${featureCount}</h5>
            <button type="button" class="btn btn-danger btn-sm remove-feature-btn">
                <i class="bi bi-trash"></i>
            </button>
        </div>
        <div class="mb-3">
            <label for="featureCategory${featureCount}" class="form-label">Kategori:</label>
            <input type="text" id="featureCategory${featureCount}" class="form-control" placeholder="Kategori">
        </div>
        <div class="mb-3">
            <label for="featureDescription${featureCount}" class="form-label">Açıklama:</label>
            <input type="text" id="featureDescription${featureCount}" class="form-control" placeholder="Açıklama">
        </div>
        <div class="mb-3">
            <label for="featureFile${featureCount}" class="form-label">Özellik Dosyası (PDF veya PNG):</label>
            <input type="file" id="featureFile${featureCount}" class="form-control" accept=".pdf,.png">
        </div>
    `;
    featuresContainer.appendChild(featureDiv);

    // Özellik Kaldırma Butonu
    featureDiv.querySelector('.remove-feature-btn').addEventListener('click', () => {
        featureDiv.remove();
        updateFeaturePreview();
    });

    // Canlı Önizleme Güncelleme
    featureDiv.querySelectorAll('input').forEach(input => {
        input.addEventListener('input', updateFeaturePreview);
    });
}


function updatePreview() {
    // Ürün Adı ve Fiyatları güncelle
    const productName = document.getElementById('productName').value || 'Ürün Adı';
    const listPrice = document.getElementById('listPrice').value
        ? document.getElementById('listPrice').value + ' TL'
        : '';
    const discountedPrice = document.getElementById('discountedPrice').value
        ? document.getElementById('discountedPrice').value + ' TL'
        : '0.00 TL';

    document.getElementById('previewProductName').textContent = productName;
    document.getElementById('previewDiscountedPrice').textContent = discountedPrice;
    document.getElementById('previewListPrice').textContent = listPrice;

    document.getElementById('previewProductDescription').textContent =
        document.getElementById('productDescription').value ||
        'Ürün açıklaması burada görünecek.';

    const productLink = document.getElementById('productLink').value.trim();
    const previewProductLinkElement = document.getElementById('previewProductLink');

    if (productLink) {
        previewProductLinkElement.innerHTML = `<a href="${productLink}" target="_blank">Ürüne Git</a>`;
    } else {
        previewProductLinkElement.innerHTML = '';
    }
    // Özellikleri güncelle
    updateFeaturePreview();

    // Etiket önizlemesini güncelle
    document.getElementById('labelProductName').textContent = productName;
    document.getElementById('labelProductCode').textContent =
        document.getElementById('productCode').value || 'Ürün Kodu';

    // Etiket QR kodunu güncelle
    const productKey = isEditing ? editingProductKey : 'new_product';
    updateLabelQRCode(productKey);
}

function updateLabelQRCode(productKey) {
    const labelQRCodeElement = document.getElementById('labelQRCode');
    labelQRCodeElement.innerHTML = '';
    const qrData = `https://erkayayazilim.github.io/qrcode/user.html?id=${productKey}`;

    // QR kodunu daha büyük boyutta oluştur (800x800) 
    // Sonra CSS ile sığdırıyoruz.
    new QRCode(labelQRCodeElement, {
        text: qrData,
        width: 400,
        height: 400,
        correctLevel: QRCode.CorrectLevel.H
    });
}

// PNG İndirme Fonksiyonu - Çözünürlüğü artırma
document.getElementById('downloadLabelBtn').addEventListener('click', function() {
    const labelElement = document.getElementById('labelElement');
    html2canvas(labelElement, {
        scale: 2 // Çözünürlüğü 2 katına çıkartıyoruz
    }).then(canvas => {
        const dataURL = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = dataURL;
        link.download = 'etiket.png';
        link.click();
    });
});

// Yazdırma Fonksiyonu
document.getElementById('printLabelBtn').addEventListener('click', function() {
    window.print();
});

function printLabel() {
    const labelElement = document.getElementById('labelElement');
    html2canvas(labelElement).then(canvas => {
        const dataURL = canvas.toDataURL('image/png');
        const printWindow = window.open('', '', 'width=1417,height=945');
        printWindow.document.write('<html><head><title>Etiket Yazdır</title></head><body style="margin:0;padding:0;">');
        printWindow.document.write(`<img src="${dataURL}" style="width:100%;height:auto;">`);
        printWindow.document.write('</body></html>');
        printWindow.document.close();

        // Resim yüklendikten sonra yazdırma penceresini aç
        printWindow.onload = function () {
            printWindow.focus();
            printWindow.print();
        };
    });
}




// Etiket Yönünü Değiştirme Butonu
// Etiket Yönünü Değiştirme Butonu
document.getElementById('toggleOrientationBtn').addEventListener('click', toggleLabelOrientation);

function toggleLabelOrientation() {
    const labelElement = document.getElementById('labelElement');
    labelElement.classList.toggle('vertical');
}



function updateImagePreview() {
    const previewCarouselInner = document.getElementById('previewCarouselInner');
    previewCarouselInner.innerHTML = '';
    const files = document.getElementById('productImages').files;

    if (files.length > 0) {
        for (let i = 0; i < files.length; i++) {
            const carouselItem = document.createElement('div');
            carouselItem.className = 'carousel-item';
            if (i === 0) {
                carouselItem.classList.add('active');
            }
            const img = document.createElement('img');
            img.src = URL.createObjectURL(files[i]);
            img.className = 'd-block w-100';
            carouselItem.appendChild(img);
            previewCarouselInner.appendChild(carouselItem);
        }
    } else {
        // Düzenleme sırasında, eğer yeni resim seçilmezse, mevcut resimleri önizlemede göster
        if (isEditing && existingProductData.images && existingProductData.images.length > 0) {
            existingProductData.images.forEach((imageUrl, index) => {
                const carouselItem = document.createElement('div');
                carouselItem.className = 'carousel-item';
                if (index === 0) {
                    carouselItem.classList.add('active');
                }
                const img = document.createElement('img');
                img.src = imageUrl;
                img.className = 'd-block w-100';
                carouselItem.appendChild(img);
                previewCarouselInner.appendChild(carouselItem);
            });
        } else {
            // Varsayılan resim
            const carouselItem = document.createElement('div');
            carouselItem.className = 'carousel-item active';
            const img = document.createElement('img');
            img.src = 'placeholder.jpg'; // Varsayılan resim yolu
            img.className = 'd-block w-100';
            carouselItem.appendChild(img);
            previewCarouselInner.appendChild(carouselItem);
        }
    }
}

function updateFeaturePreview() {
    const previewFeaturesTable = document.getElementById('previewFeaturesTable');
    previewFeaturesTable.innerHTML = '';
    const features = document.querySelectorAll('.feature');
    features.forEach(featureDiv => {
        const featureId = featureDiv.getAttribute('data-feature-id');
        const categoryElement = featureDiv.querySelector(`#featureCategory${featureId}`);
        const descriptionElement = featureDiv.querySelector(`#featureDescription${featureId}`);

        const category = categoryElement ? categoryElement.value.trim() || 'Kategori' : 'Kategori';
        const description = descriptionElement ? descriptionElement.value.trim() || 'Açıklama' : 'Açıklama';

        const tr = document.createElement('tr');
        const th = document.createElement('th');
        th.textContent = category;
        const td = document.createElement('td');
        td.textContent = description;

        tr.appendChild(th);
        tr.appendChild(td);

        previewFeaturesTable.appendChild(tr);
    });
}

async function saveProduct() {
    const productName = document.getElementById('productName').value.trim();
    const productCode = document.getElementById('productCode').value.trim();
    const listPrice = document.getElementById('listPrice').value.trim();
    const discountedPrice = document.getElementById('discountedPrice').value.trim();
    const productLink = document.getElementById('productLink').value.trim();
    const productDescription = document.getElementById('productDescription').value.trim();
    const productImages = document.getElementById('productImages').files;

    if (productName && productCode && productDescription) {
        // Ürün anahtarı belirle
        let productKey = isEditing ? editingProductKey : database.ref().child('products').push().key;

        // Veriyi hazırlayın
        const productData = {
            productName: productName,
            productCode: productCode,
            listPrice: listPrice,
            discountedPrice: discountedPrice,
            productDescription: productDescription,
            productLink: productLink,
            images: isEditing ? existingProductData.images || [] : [],
            features: [],
            stock: existingProductData.stock || 0,
            saleable: existingProductData.saleable || false
        };

        try {
            // Yükleme Progress Bar'ını göster
            const uploadProgress = document.getElementById('uploadProgress');
            const progressBar = document.getElementById('progressBar');
            uploadProgress.classList.remove('d-none');
            let totalFiles = productImages.length + document.querySelectorAll('.feature input[type="file"]').length;
            let uploadedFiles = 0;

            // Ürün resimlerini yükle
            if (productImages.length > 0) {
                productData.images = []; // Eski resimleri sıfırla
                for (let i = 0; i < productImages.length; i++) {
                    const imageFile = productImages[i];
                    const storageRef = storage.ref().child(`products/${productKey}/images/${imageFile.name}`);
                    const snapshot = await storageRef.put(imageFile);
                    const downloadURL = await snapshot.ref.getDownloadURL();
                    productData.images.push(downloadURL);

                    // Progress Bar'ı güncelle
                    uploadedFiles++;
                    let progress = Math.round((uploadedFiles / totalFiles) * 100);
                    progressBar.style.width = progress + '%';
                    progressBar.textContent = progress + '%';
                }
            }

            // Özellikleri topla
            const features = document.querySelectorAll('.feature');
            for (let i = 0; i < features.length; i++) {
                const featureDiv = features[i];
                const featureId = featureDiv.getAttribute('data-feature-id');
                const category = featureDiv.querySelector(`#featureCategory${featureId}`).value.trim();
                const description = featureDiv.querySelector(`#featureDescription${featureId}`).value.trim();
                const featureFile = featureDiv.querySelector(`#featureFile${featureId}`).files[0];

                let featureFileURL = '';

                if (featureFile) {
                    const storageRef = storage.ref().child(`products/${productKey}/features/${featureFile.name}`);
                    const snapshot = await storageRef.put(featureFile);
                    featureFileURL = await snapshot.ref.getDownloadURL();

                    // Progress Bar'ı güncelle
                    uploadedFiles++;
                    let progress = Math.round((uploadedFiles / totalFiles) * 100);
                    progressBar.style.width = progress + '%';
                    progressBar.textContent = progress + '%';
                } else if (isEditing && existingProductData.features && existingProductData.features[i]) {
                    featureFileURL = existingProductData.features[i].fileURL || '';
                }

                productData.features.push({
                    category: category,
                    description: description,
                    fileURL: featureFileURL
                });
            }

            // Veriyi Realtime Database'e ekle
            await database.ref('products/' + productKey).set(productData);

            alert(isEditing ? 'Ürün güncellendi!' : 'Kayıt başarılı! QR kodu aşağıda görüntüleyebilir ve indirebilirsiniz.');

            // QR kodunu oluştur ve kullanıcıya göster
            const qrData = `https://erkayayazilim.github.io/qrcode/user.html?id=${productKey}`;

            const qrcodeElement = document.getElementById('qrcode');
            qrcodeElement.innerHTML = ''; // Önceki QR kodunu temizle

            new QRCode(qrcodeElement, {
                text: qrData,
                width: 256,
                height: 256,
            });

            // QR kodunu indirilebilir yap
            setTimeout(() => {
                const canvas = qrcodeElement.querySelector('canvas');
                const imgData = canvas.toDataURL('image/png');

                // Ürün ismini dosya adına uygun hale getirin
                const sanitizedProductName = productName.replace(/[<>:"\/\\|?*]+/g, '_');

                const downloadLink = document.createElement('a');
                downloadLink.href = imgData;
                downloadLink.download = `${sanitizedProductName}.png`;
                downloadLink.textContent = 'QR Kodu İndir';
                downloadLink.classList.add('btn', 'btn-primary', 'mt-3');
                qrcodeElement.appendChild(downloadLink);
            }, 500);

            // Etiket QR kodunu güncelle
            updateLabelQRCode(productKey);

            // Formu sıfırla ve başka bir ürün ekleme butonunu göster
            const newProductBtn = document.createElement('button');
            newProductBtn.textContent = 'Yeni Ürün Ekle';
            newProductBtn.id = 'newProductBtn';
            newProductBtn.classList.add('btn', 'btn-success', 'mt-3');
            newProductBtn.onclick = () => {
                clearProductForm();
                showAddProductForm();
            };
            document.getElementById('addProductForm').appendChild(newProductBtn);

            uploadProgress.classList.add('d-none');
            progressBar.style.width = '0%';
            progressBar.textContent = '0%';

            

        } catch (error) {
            console.error('Hata:', error);
            alert('Ürün kaydedilirken bir hata oluştu.');
            uploadProgress.classList.add('d-none');
            progressBar.style.width = '0%';
            progressBar.textContent = '0%';
        }

        // Etiketi göster
        document.getElementById('labelContainer').scrollIntoView({ behavior: 'smooth' });

    } else {
        alert('Lütfen tüm alanları doldurun.');
    }
}

// Ürünleri Yükleme ve Arama İşlevleri
let allProducts = [];

function loadAllProducts() {
    database.ref('products').once('value')
        .then(snapshot => {
            allProducts = [];

            snapshot.forEach(childSnapshot => {
                const productKey = childSnapshot.key;
                const productData = childSnapshot.val();
                allProducts.push({ key: productKey, ...productData });
            });
        })
        .catch(error => {
            console.error('Hata:', error);
        });
}

function updateTotalProductCount() {
    database.ref('products').once('value')
        .then(snapshot => {
            const totalProducts = snapshot.numChildren();
            document.getElementById('totalProducts').textContent = `Toplam Ürün: ${totalProducts}`;
        })
        .catch(error => {
            console.error('Hata:', error);
        });
}


function searchProducts() {
    const searchValue = document.getElementById('searchInput').value.toLowerCase().trim();

    if (searchValue === '') {
        // Arama kutusu boşsa tabloyu temizle ve toplam ürün sayısını güncelle
        const productsTableBody = document.querySelector('#productsTable tbody');
        productsTableBody.innerHTML = '';
        document.getElementById('totalProducts').textContent = `Toplam Ürün: ${allProducts.length}`;
        return;
    }

    const filteredProducts = allProducts.filter(product =>
        product.productName.toLowerCase().includes(searchValue) ||
        (product.productCode && product.productCode.toLowerCase().includes(searchValue))
    );

    const productsTableBody = document.querySelector('#productsTable tbody');
    productsTableBody.innerHTML = '';

    filteredProducts.forEach(product => {
        const imageSrc = (product.images && product.images.length > 0) ? product.images[0] : '';

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><img src="${imageSrc}" alt="Ürün Resmi" style="width: 50px; height: 50px; object-fit: cover;"></td>
            <td>${product.productName}</td>
            <td>${product.productCode || ''}</td>
            <td>${product.listPrice || ''} TL</td>
            <td>${product.discountedPrice || ''} TL</td>
            <td>${product.stock || 0}</td>
            <td>${product.saleable ? 'Evet' : 'Hayır'}</td>
            <td><img src="" alt="QR Kod" id="qrImg${product.key}" style="width: 50px; height: 50px;"></td>
            <td class="action-buttons text-end">
                <button class="btn btn-primary btn-sm" onclick="downloadQRCode('${product.key}')">
                    <i class="bi bi-download"></i>
                </button>
                <button class="btn btn-warning btn-sm" onclick="editProduct('${product.key}')">
                    <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-danger btn-sm" onclick="deleteProduct('${product.key}')">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        `;
        productsTableBody.appendChild(tr);

        // QR kodu oluştur ve img etiketi içine yerleştir
        const qrData = `https://erkayayazilim.github.io/qrcode/user.html?id=${product.Key}`;
        const tempDiv = document.createElement('div');
        new QRCode(tempDiv, {
            text: qrData,
            width: 50,
            height: 50,
        });
        setTimeout(() => {
            const canvas = tempDiv.querySelector('canvas');
            const imgData = canvas.toDataURL('image/png');
            document.getElementById(`qrImg${product.key}`).src = imgData;
        }, 500);
    });

    // Bulunan ürün sayısını güncelle
    document.getElementById('totalProducts').textContent = `Bulunan Ürün: ${filteredProducts.length}`;
}

function readExcelFile(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = async (e) => {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            excelData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
            alert('Excel dosyası başarıyla yüklendi. Güncelleme işlemini başlatmak için "Yükle ve Güncelle" butonuna basın.');
        };
        reader.readAsArrayBuffer(file);
    }
}

function addMappingField() {
    const mappingContainer = document.getElementById('columnMapping');
    const mappingRow = document.createElement('div');
    mappingRow.classList.add('row', 'mb-2');
    mappingRow.innerHTML = `
        <div class="col-md-6">
            <select class="form-select update-field">
                <option value="listPrice">Liste Fiyatı</option>
                <option value="discountedPrice">İndirimli Fiyat</option>
                <option value="stock">Mevcut Stok</option>
                <option value="saleable">Satılabilir</option>
            </select>
        </div>
        <div class="col-md-6">
            <input type="text" class="form-control excel-column-name" placeholder="Excel Sütun İsmi">
        </div>
    `;
    mappingContainer.appendChild(mappingRow);
}

async function handleExcelUpload() {
    if (!excelData) {
        alert('Lütfen önce bir Excel dosyası yükleyin.');
        return;
    }

    try {
        // Kullanıcıdan ürün kodu sütun adını al
        const productCodeColumnName = document.getElementById('productCodeColumnName').value.trim().toUpperCase();
        if (!productCodeColumnName) {
            alert('Lütfen ürün kodu sütun adını giriniz.');
            return;
        }

        // Kullanıcıdan eşleştirmeleri al
        const mappings = [];
        const mappingRows = document.querySelectorAll('#columnMapping .row');
        mappingRows.forEach(row => {
            const field = row.querySelector('.update-field').value;
            const columnName = row.querySelector('.excel-column-name').value.trim().toUpperCase();
            if (field && columnName) {
                mappings.push({ field, columnName });
            }
        });

        if (mappings.length === 0) {
            alert('Lütfen en az bir alan eşleştirmesi yapın.');
            return;
        }

        // Başlık satırını al
        const headers = excelData[0].map(header => header.toString().toUpperCase());
        const productCodeIndex = headers.indexOf(productCodeColumnName);

        if (productCodeIndex === -1) {
            alert(`Excel dosyasında "${productCodeColumnName}" sütunu bulunamadı.`);
            return;
        }

        // Alanların indekslerini belirle
        mappings.forEach(mapping => {
            mapping.index = headers.indexOf(mapping.columnName);
            if (mapping.index === -1) {
                alert(`Excel dosyasında "${mapping.columnName}" sütunu bulunamadı.`);
            }
        });

        // İşlem göstergesi
        const totalRows = excelData.length - 1;
        let processedRows = 0;

        // Yükleme Progress Bar'ını göster
        const uploadProgress = document.getElementById('excelUploadProgress');
        const progressBar = document.getElementById('excelProgressBar');
        uploadProgress.classList.remove('d-none');

        // Her satırı işle
        for (let i = 1; i < excelData.length; i++) {
            const row = excelData[i];
            const productCode = row[productCodeIndex];

            if (productCode) {
                // Veritabanında ürün kodu eşleşen ürünleri bul
                const snapshot = await database.ref('products').orderByChild('productCode').equalTo(productCode.toString()).once('value');
                if (snapshot.exists()) {
                    snapshot.forEach(childSnapshot => {
                        const updates = {};
                        mappings.forEach(mapping => {
                            const value = row[mapping.index];
                            if (value !== undefined && value !== null) {
                                if (mapping.field === 'saleable') {
                                    updates[mapping.field] = value.toString().toLowerCase() === 'evet' ? true : false;
                                } else {
                                    updates[mapping.field] = value.toString();
                                }
                            }
                        });
                        childSnapshot.ref.update(updates);
                    });
                } else {
                    console.log(`Ürün kodu "${productCode}" veritabanında bulunamadı.`);
                    // Yeni ürün ekleme işlemi yapılmayacak
                }
            }

            processedRows++;
            // İlerleme yüzdesini göster
            let progress = Math.round((processedRows / totalRows) * 100);
            progressBar.style.width = progress + '%';
            progressBar.textContent = progress + '%';
        }

        alert('Güncelleme işlemi başarıyla tamamlandı.');
        

        // Yükleme Progress Bar'ını gizle
        uploadProgress.classList.add('d-none');
        progressBar.style.width = '0%';
        progressBar.textContent = '0%';

        // Excel verilerini sıfırla
        excelData = null;
        document.getElementById('excelFileInput').value = '';

    } catch (error) {
        console.error('Excel dosyası işlenirken hata oluştu:', error);
        alert('Excel dosyası işlenirken hata oluştu.');
        // Yükleme Progress Bar'ını gizle
        uploadProgress.classList.add('d-none');
        progressBar.style.width = '0%';
        progressBar.textContent = '0%';
    }
}


// QR Kodunu İndirme
function downloadQRCode(productKey) {
    const qrData = `https://erkayayazilim.github.io/qrcode/user.html?id=${productKey}`;
    const tempDiv = document.createElement('div');
    new QRCode(tempDiv, {
        text: qrData,
        width: 256,
        height: 256,
    });
    setTimeout(() => {
        const canvas = tempDiv.querySelector('canvas');
        const imgData = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.href = imgData;
        downloadLink.download = 'qrcode.png';
        downloadLink.click();
    }, 500);
}

// Ürünü Silme
function deleteProduct(productKey) {
    if (confirm('Ürünü silmek istediğinize emin misiniz?')) {
        database.ref('products/' + productKey).remove()
        .then(() => {
            alert('Ürün silindi.');
           
        })
        .catch(error => {
            console.error('Hata:', error);
            alert('Ürün silinirken bir hata oluştu.');
        });
    }
}

// Ürünü Düzenleme
function editProduct(productKey) {
    // Formu göster
    showAddProductForm();
    // Formu temizle
    clearProductForm();
    // Durumları ayarla
    isEditing = true;
    editingProductKey = productKey;
    document.getElementById('formTitle').textContent = 'Ürünü Düzenle';
    document.getElementById('saveBtn').innerHTML = '<i class="bi bi-save me-1"></i> Güncelle';

    database.ref('products/' + productKey).once('value')
    .then(snapshot => {
        const data = snapshot.val();
        if (data) {
            existingProductData = data;

            // Formu doldur
            document.getElementById('productName').value = data.productName;
            document.getElementById('productCode').value = data.productCode || '';
            document.getElementById('productLink').value = data.productLink || '';
            document.getElementById('listPrice').value = data.listPrice || '';
            document.getElementById('discountedPrice').value = data.discountedPrice || '';
            document.getElementById('productDescription').value = data.productDescription;

            // Resimleri önizlemeye ekle
            if (data.images && data.images.length > 0) {
                const previewCarouselInner = document.getElementById('previewCarouselInner');
                previewCarouselInner.innerHTML = '';
                data.images.forEach((imageUrl, index) => {
                    const carouselItem = document.createElement('div');
                    carouselItem.className = 'carousel-item';
                    if (index === 0) {
                        carouselItem.classList.add('active');
                    }
                    const img = document.createElement('img');
                    img.src = imageUrl;
                    img.className = 'd-block w-100';
                    carouselItem.appendChild(img);
                    previewCarouselInner.appendChild(carouselItem);
                });
            }

            // Özellikleri forma ekle
            if (data.features && data.features.length > 0) {
                data.features.forEach((feature, index) => {
                    addFeature();
                    const featureId = featureCount;
                    document.getElementById(`featureCategory${featureId}`).value = feature.category;
                    document.getElementById(`featureDescription${featureId}`).value = feature.description;
                    // Özellik dosyalarını ekleyebilirsiniz
                });
                // Özellik önizlemesini güncelle
                updateFeaturePreview();
            }

            // Canlı önizlemeyi güncelle
            updatePreview();
            // Resim önizlemesini güncelle
            updateImagePreview();
        }
    })
    .catch(error => {
        console.error('Hata:', error);
        alert('Ürün yüklenirken bir hata oluştu.');
    });
}

// Ayarları Kaydetme ve Yükleme
function saveSettings() {
    const email = document.getElementById('settingsEmail').value.trim();
    const phone = document.getElementById('settingsPhone').value.trim();
    const address = document.getElementById('settingsAddress').value.trim();

    const settingsData = {
        email: email,
        phone: phone,
        address: address
    };

    database.ref('settings').set(settingsData)
    .then(() => {
        alert('Ayarlar kaydedildi.');
        loadSettingsForPreview();
    })
    .catch(error => {
        console.error('Hata:', error);
        alert('Ayarlar kaydedilirken bir hata oluştu.');
    });
}

function loadSettings() {
    database.ref('settings').once('value')
    .then(snapshot => {
        const data = snapshot.val();
        if (data) {
            document.getElementById('settingsEmail').value = data.email || '';
            document.getElementById('settingsPhone').value = data.phone || '';
            document.getElementById('settingsAddress').value = data.address || '';
        }
    })
    .catch(error => {
        console.error('Hata:', error);
    });
}

function loadSettingsForPreview() {
    database.ref('settings').once('value')
    .then(snapshot => {
        const data = snapshot.val();
        if (data) {
            document.getElementById('previewPhone').textContent = data.phone || 'Telefon';
            document.getElementById('previewEmail').textContent = data.email || 'E-posta';
        }
    })
    .catch(error => {
        console.error('Hata:', error);
    });
}

function showAllProductsPage() {
    hideAllSections();
    document.getElementById('allProductsPage').classList.remove('d-none');
    setActiveNav('navViewAllProducts');

    // Tüm ürünleri yükle ve progress bar ile göster
    loadAllProductsWithProgress();
}

// Tüm Ürünleri Yükleme ve Progress Bar Gösterme Fonksiyonu
function loadAllProductsWithProgress() {
    const allProductsTableBody = document.querySelector('#allProductsTable tbody');
    allProductsTableBody.innerHTML = ''; // Önceki verileri temizle

    const allProductsProgress = document.getElementById('allProductsProgress');
    const allProductsProgressBar = document.getElementById('allProductsProgressBar');
    allProductsProgress.style.display = 'block'; // Progress bar'ı göster
    allProductsProgressBar.style.width = '0%'; // Progress bar'ı sıfırla

    database.ref('products').once('value')
        .then(snapshot => {
            const totalProducts = snapshot.numChildren();
            let loadedProducts = 0;

            snapshot.forEach(childSnapshot => {
                const productKey = childSnapshot.key;
                const productData = childSnapshot.val();

                // Ürünü tabloya ekle
                const imageSrc = (productData.images && productData.images.length > 0) ? productData.images[0] : '';

                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td><img src="${imageSrc}" alt="Ürün Resmi" style="width: 50px; height: 50px; object-fit: cover;"></td>
                    <td>${productData.productName}</td>
                    <td>${productData.productCode || ''}</td>
                    <td>${productData.listPrice || ''} TL</td>
                    <td>${productData.discountedPrice || ''} TL</td>
                    <td>${productData.stock || 0}</td>
                    <td>${productData.saleable ? 'Evet' : 'Hayır'}</td>
                    <td><img src="" alt="QR Kod" id="qrImgAll${productKey}" style="width: 50px; height: 50px;"></td>
                `;
                allProductsTableBody.appendChild(tr);

                // QR kodu oluştur ve tabloya ekle
                const qrData = `https://erkayayazilim.github.io/qrcode/user.html?id=${productKey}`;
                const tempDiv = document.createElement('div');
                new QRCode(tempDiv, {
                    text: qrData,
                    width: 50,
                    height: 50,
                });
                setTimeout(() => {
                    const canvas = tempDiv.querySelector('canvas');
                    const imgData = canvas.toDataURL('image/png');
                    document.getElementById(`qrImgAll${productKey}`).src = imgData;
                }, 500);

                // Progress bar'ı güncelle
                loadedProducts++;
                const progress = Math.round((loadedProducts / totalProducts) * 100);
                allProductsProgressBar.style.width = progress + '%';
                allProductsProgressBar.textContent = progress + '%';

                // Yükleme tamamlandığında progress bar'ı gizle
                if (loadedProducts === totalProducts) {
                    allProductsProgress.style.display = 'none';
                }
            });
        })
        .catch(error => {
            console.error('Hata:', error);
            allProductsProgress.style.display = 'none';
            alert('Ürünler yüklenirken bir hata oluştu.');
        });
}
function showPrintLabelsPage() {
    hideAllSections();
    document.getElementById('printLabelsPage').classList.remove('d-none');
    setActiveNav('navPrintLabels');
    loadProductsForLabelPrinting();
}
function hideAllSections() {
    document.getElementById('dashboard').classList.add('d-none');
    document.getElementById('addProductForm').classList.add('d-none');
    document.getElementById('settingsPage').classList.add('d-none');
    document.getElementById('excelUploadPage').classList.add('d-none');
    document.getElementById('allProductsPage').classList.add('d-none');
    document.getElementById('printLabelsPage').classList.add('d-none'); // Yeni eklenen sayfa
}function loadProductsForLabelPrinting() {
    const labelProductsTableBody = document.querySelector('#labelProductsTable tbody');
    labelProductsTableBody.innerHTML = '';

    // Tüm ürünleri yükleyin
    database.ref('products').once('value')
        .then(snapshot => {
            const products = [];
            snapshot.forEach(childSnapshot => {
                const productKey = childSnapshot.key;
                const productData = childSnapshot.val();
                products.push({ key: productKey, ...productData });
            });

            // Tabloya ürünleri ekleyin
            products.forEach(product => {
                const imageSrc = (product.images && product.images.length > 0) ? product.images[0] : '';
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td><input type="checkbox" class="product-checkbox" data-product-key="${product.key}"></td>
                    <td><img src="${imageSrc}" alt="Ürün Resmi" style="width: 50px; height: 50px; object-fit: cover;"></td>
                    <td>${product.productName}</td>
                    <td>${product.productCode || ''}</td>
                    <td>${product.discountedPrice || ''} TL</td>
                    <td>${product.listPrice || ''} TL</td>
                `;
                labelProductsTableBody.appendChild(tr);
            });

            // Arama işlevi
            document.getElementById('labelSearchInput').addEventListener('input', function () {
                const searchValue = this.value.toLowerCase().trim();
                const rows = labelProductsTableBody.querySelectorAll('tr');
                rows.forEach(row => {
                    const productName = row.children[2].textContent.toLowerCase();
                    if (productName.includes(searchValue)) {
                        row.style.display = '';
                    } else {
                        row.style.display = 'none';
                    }
                });
            });
        })
        .catch(error => {
            console.error('Hata:', error);
        });
}

// Excel indirme butonu için event listener
document.getElementById('downloadExcelBtn').addEventListener('click', downloadSelectedProductsAsExcel);

function downloadSelectedProductsAsExcel() {
    const selectedProductKeys = [];
    const checkboxes = document.querySelectorAll('.product-checkbox');
    checkboxes.forEach(checkbox => {
        if (checkbox.checked) {
            selectedProductKeys.push(checkbox.getAttribute('data-product-key'));
        }
    });

    if (selectedProductKeys.length === 0) {
        alert('Lütfen en az bir ürün seçin.');
        return;
    }

    // Seçilen ürünlerin verilerini al
    const promises = selectedProductKeys.map(key => {
        return database.ref('products/' + key).once('value')
            .then(snapshot => {
                const data = snapshot.val();
                // QR kod linkini oluştur
                const qrLink = `https://erkayayazilim.github.io/qrcode/user.html?id=${key}`;
                return {
                    'Ürün Kodu': data.productCode || '',
                    'Ürün İsmi': data.productName || '',
                    'Satış Fiyatı': data.discountedPrice ? `${data.discountedPrice} TL` : '',
                    'Liste Fiyatı': data.listPrice ? `${data.listPrice} TL` : '',
                    'Ürün Linki': qrLink
                };
            });
    });

    Promise.all(promises)
        .then(productsData => {
            // XLSX.js kullanarak Excel dosyası oluştur
            const worksheet = XLSX.utils.json_to_sheet(productsData);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Ürünler');

            // Excel dosyasını indirin
            const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
            const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
            const url = URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = url;
            link.download = 'urunler.xlsx';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        })
        .catch(error => {
            console.error('Hata:', error);
            alert('Excel dosyası oluşturulurken bir hata oluştu.');
        });
}
