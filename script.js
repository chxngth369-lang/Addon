/**
 * ==========================================================================
 * ✨ STAR MCBE | AUTOMATIC GALLERY & MODAL SYSTEM
 * ==========================================================================
 * ระบบจัดการข้อมูลหน้าร้าน: จัดเรียงวันออโต้, ค้นหาแบบเรียลไทม์, และคัดกรองหมวดหมู่
 */

// 🚀 1. รันระบบทันทีที่โครงสร้าง HTML (DOM) ถูกดาวน์โหลดและเตรียมพร้อมใช้งาน
document.addEventListener('DOMContentLoaded', () => {
    initGallerySystem();
});

// 🔍 2. ผูกเหตุการณ์พิมพ์ค้นหาในกล่อง SearchInput ให้ทำงานแบบ Realtime
const searchInput = document.getElementById('searchInput');
if (searchInput) {
    searchInput.addEventListener('keyup', updateGallery);
}

/**
 * 🕒 3. ฟังก์ชันเริ่มต้นระบบ: คำนวณวันที่ออโต้ -> แปะป้าย New -> จัดเรียงขึ้นด้านบน
 */
function initGallerySystem() {
    const container = document.getElementById('scriptGrid');
    if (!container) return; // ป้องกัน Error หากหา Grid ไม่เจอ

    const cards = Array.from(container.getElementsByClassName('card'));
    
    // ⚙️ CONFIG: กำหนดจำนวนวัน (ถ้าไอเทมลงเว็บไม่เกินจำนวนวันนี้ จะได้รับป้าย "New")
    const NEW_DAYS_THRESHOLD = 3; 
    const today = new Date();

    cards.forEach(card => {
        const dateString = card.getAttribute('data-date');
        if (!dateString) return;

        // คำนวณหาความต่างระหว่าง "วันที่ปัจจุบัน" กับ "วันที่ในการ์ดไอเทม"
        const itemDate = new Date(dateString);
        const timeDiff = today.getTime() - itemDate.getTime();
        const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

        // กฎการแปะป้าย New: ถ้าระยะห่างของวันอยู่ในเกณฑ์ 0 ถึง 3 วัน และยังไม่มีป้ายอยู่
        if (daysDiff <= NEW_DAYS_THRESHOLD && daysDiff >= 0) {
            const badgeContainer = card.querySelector('.badge-container');
            if (badgeContainer && !badgeContainer.querySelector('.badge-new')) {
                const newBadge = document.createElement('span');
                newBadge.className = 'badge badge-new';
                newBadge.innerText = 'New';
                // ดึงป้าย New ไปแทรกไว้เป็นตำแหน่งแรกสุดภายในกล่องป้าย
                badgeContainer.insertBefore(newBadge, badgeContainer.firstChild);
            }
        }
    });

    // 🔄 ระบบเรียงข้อมูล (Auto-Sorting): ลากการ์ดที่ลงวันที่ "ใหม่ที่สุด" ขึ้นไปแถวบนสุด
    cards.sort((a, b) => {
        const dateA = new Date(a.getAttribute('data-date') || 0);
        const dateB = new Date(b.getAttribute('data-date') || 0);
        return dateB - dateA; // คำนวณแบบ วันที่ล่าสุด -> วันที่เก่ากว่า
    });

    // ล้างข้อมูลการ์ดตำแหน่งเดิมใน Grid ออกทั้งหมด
    container.innerHTML = "";
    
    // ยิงการ์ดที่ถูกจัดเรียงตามลำดับเวลาใหม่เข้าไปในโครงสร้างเว็บอีกครั้ง
    cards.forEach(card => container.appendChild(card));

    // ตรวจสอบเช็คการฟิลเตอร์และเปิดหน้าเว็บครั้งแรก
    updateGallery();
}

/**
 * 🏷️ 4. ฟังก์ชันคัดกรอง (Filtering): จัดการกรองคำค้นหา และเช็คหมวดหมู่บนไซด์บาร์
 */
function updateGallery() {
    const searchInputField = document.getElementById('searchInput');
    const searchTerm = searchInputField ? searchInputField.value.toLowerCase() : '';
    
    // ดึงสถานะหมวดหมู่ปัจจุบันที่ถูกเลือกอยู่บนแถบเมนูด้านซ้าย
    const activeNavItem = document.querySelector('.nav-item.active');
    const activeCategory = activeNavItem ? activeNavItem.getAttribute('data-cat') : 'all';
    
    const cards = document.querySelectorAll('.card');
    const emptyState = document.getElementById('empty-state');
    
    let visibleCardsCount = 0;

    cards.forEach(card => {
        const title = card.querySelector('h3').innerText.toLowerCase();
        const category = card.getAttribute('data-category');
        
        // เงื่อนไขเช็ค: หมวดหมู่ตรงกัน (หรือเลือกเป็น All) AND ชื่อเรื่องมีคำที่พิมพ์ค้นหา
        const isCategoryMatch = (activeCategory === 'all' || category === activeCategory);
        const isSearchMatch = title.includes(searchTerm);

        if (isCategoryMatch && isSearchMatch) {
            visibleCardsCount++;
            
            // สั่งเปิดการแสดงผล และทำการกระตุ้น (Trigger) แอนิเมชันตอนการ์ดเด้งขึ้นมาใหม่
            if (card.style.display !== "flex") {
                card.style.display = "flex";
                card.style.animation = 'none';
                card.offsetHeight; // ล้างสถานะรีเฟรชค่าสไตล์ของเบราว์เซอร์
                card.style.animation = ''; // ปล่อยให้ CSS รันแอนิเมชันการ์ดโผล่ใหม่อีกครั้ง
            }
        } else {
            // ซ่อนการ์ดที่ไม่ตรงตามเงื่อนไข
            card.style.display = "none";
        }
    });

    // ⚠️ ตรวจสอบ Empty State: หากคัดกรองแล้วไม่เหลือการ์ดเลยแม้แต่ใบเดียว ให้แสดงข้อความแจ้งเตือน
    if (emptyState) {
        if (visibleCardsCount === 0) {
            emptyState.style.display = "block";
        } else {
            emptyState.style.display = "none";
        }
    }
}

/**
 * 🎯 5. ฟังก์ชันสลับหมวดหมู่ไซด์บาร์ (Category Switching)
 * @param {string} category - ชื่อหมวดหมู่ที่ถูกกดเลือก (เช่น 'addon', 'shader')
 * @param {HTMLElement} element - ตัวแปรอ้างอิงปุ่มเมนูที่ถูกกดคลิก
 */
function filterScripts(category, element) {
    if (!element) return;
    
    // ลบคลาส 'active' ออกจากปุ่มเมนูอันเก่าทั้งหมดบนไซด์บาร์
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    
    // แปะคลาส 'active' ให้กับปุ่มเมนูอันใหม่ที่ผู้เล่นเพิ่งกดคลิก
    element.classList.add('active');
    
    // สั่งประมวลผลการแสดงผลการ์ดหน้าร้านใหม่ตามหมวดหมู่ล่าสุด
    updateGallery();
}

/**
 * 📦 6. ฟังก์ชันเปิดหน้าต่างโหลดลิงก์ (Open Modal)
 * @param {string} name - ชื่อของไฟล์ม็อดหรือแพตช์ที่จะแสดงผลในหัวข้อป๊อปอัป
 * @param {string} cat - ชื่อประเภทหลัก
 * @param {string} link - ลิงก์ปลายทาง (เช่น Linkvertise, LootLabs, Direct Link)
 */
function openModal(name, cat, link) {
    const modal = document.getElementById('scriptModal');
    if (!modal) return;

    // เติมข้อมูลเนื้อหา ชื่อไฟล์, หมวดหมู่ และผูกลิงก์ดาวน์โหลดเข้ากับปุ่มกดในโมดอล
    document.getElementById('modalTitle').innerText = name;
    document.getElementById('modalCategory').innerText = cat;
    document.getElementById('scriptLink').href = link;
    
    const modalContent = modal.querySelector('.modal-content');
    
    // เซ็ตเอฟเฟกต์แอนิเมชันแบบสปริงตัว (Pop Open) ตอนเปิดกล่องดาวน์โหลด
    if (modalContent) {
        modalContent.style.animation = 'modalPopOpen 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) forwards';
    }
    
    modal.style.transition = 'opacity 0.25s ease';
    modal.style.opacity = '0';
    modal.style.display = "flex";
    
    // ดีเลย์เล็กน้อยเพื่อให้เฟรมอนิเมชันเปิดทำหน้าที่ได้เนียนและสมูทขึ้น
    setTimeout(() => { modal.style.opacity = '1'; }, 10);
}

/**
 * 🔒 7. ฟังก์ชันปิดหน้าต่างโหลดลิงก์ (Close Modal)
 */
function closeModal() {
    const modal = document.getElementById('scriptModal');
    if (!modal || modal.style.display === "none") return;

    const modalContent = modal.querySelector('.modal-content');
    
    // สั่งให้กล่องหดตัวแฟลชเล็กลงพร้อมจางหายไป (Pop Close)
    if (modalContent) {
        modalContent.style.animation = 'modalPopClose 0.2s cubic-bezier(0.25, 0.8, 0.25, 1) forwards';
    }
    modal.style.opacity = '0';
    
    // รอให้แอนิเมชันหดตัวทำงานเสร็จสิ้นภายใน 200ms แล้วทำการซ่อนหน้าต่างหลักพ้นสายตา
    setTimeout(() => { 
        modal.style.display = "none"; 
    }, 200); 
}

// 🖱️ 8. อำนวยความสะดวก: หากผู้ใช้งานคลิกนอกกรอบสีดำ (พื้นหลังเบลอ) ให้ปิดหน้าต่างลงออโต้
window.onclick = function(event) {
    const modal = document.getElementById('scriptModal');
    if (event.target == modal) {
        closeModal();
    }
}
