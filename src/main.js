
document.addEventListener('DOMContentLoaded', () => {
  
  // --- Module 1: Pulse Gauges Animation ---
  setTimeout(() => {
    document.querySelectorAll('.circular-progress').forEach(el => {
      const value = el.getAttribute('data-value');
      const circle = el.querySelector('.progress');
      // 251.2 is the total dasharray (2 * pi * r approx for r=40)
      // value is percentage, so dashoffset = 251.2 - (251.2 * value / 100)
      const offset = 251.2 - (251.2 * value / 100);
      circle.style.strokeDashoffset = offset;
    });
  }, 300);

  // --- Module 2: Smart GR Parser ---
  const dropzone = document.getElementById('gr-dropzone');
  const summaryCard = document.getElementById('gr-summary');
  
  const handleDrop = (e) => {
    e.preventDefault();
    dropzone.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i><p>AI Extracting rules...</p>';
    setTimeout(() => {
      dropzone.classList.add('hidden');
      summaryCard.classList.remove('hidden');
    }, 1500);
  };
  
  dropzone.addEventListener('dragover', e => e.preventDefault());
  dropzone.addEventListener('drop', handleDrop);
  dropzone.addEventListener('click', handleDrop);

  // --- Module 3: Proactive Beneficiary Radar ---
  const massNotifyBtn = document.getElementById('mass-notify-btn');
  massNotifyBtn.addEventListener('click', () => {
    const originalText = massNotifyBtn.innerHTML;
    massNotifyBtn.innerHTML = '<i class="fa-solid fa-check"></i> Sent to 3 Farmers';
    setTimeout(() => massNotifyBtn.innerHTML = originalText, 3000);
  });

  // --- Module 4: Geo-Verified Map (Leaflet) ---
  const map = L.map('map-container').setView([18.5204, 73.8567], 14); // Pune coordinates
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(map);

  const farms = [
    { name: "Sumanbai Pawar's Farm", type: "standard", lat: 18.525, lng: 73.850 },
    { name: "Raju Bhil's Farm", type: "audit", lat: 18.515, lng: 73.860 },
  ];

  const verifyBtn = document.getElementById('verify-btn');
  const cameraInt = document.getElementById('camera-integration');
  const farmNameEl = document.getElementById('selected-farm-name');
  const farmDetailsEl = document.getElementById('selected-farm-details');
  const currentTimeEl = document.getElementById('current-time');
  
  // Custom icons
  const greenIcon = L.divIcon({ className: 'custom-div-icon', html: "<div style='background-color:#2D6A4F;width:12px;height:12px;border-radius:50%;border:2px solid white;box-shadow:0 0 4px rgba(0,0,0,0.5);'></div>" });
  const redIcon = L.divIcon({ className: 'custom-div-icon', html: "<div style='background-color:#C1121F;width:12px;height:12px;border-radius:50%;border:2px solid white;box-shadow:0 0 4px rgba(0,0,0,0.5);'></div>" });

  farms.forEach(farm => {
    const marker = L.marker([farm.lat, farm.lng], {
      icon: farm.type === 'audit' ? redIcon : greenIcon
    }).addTo(map);

    marker.on('click', () => {
      farmNameEl.textContent = farm.name;
      farmDetailsEl.textContent = farm.type === 'audit' ? 'High Risk Audit: Mandatory Geo-Photo required.' : 'Standard Verification.';
      
      // Simulate matching GPS coordinates
      setTimeout(() => {
        verifyBtn.classList.remove('locked');
        verifyBtn.classList.add('unlocked');
        verifyBtn.innerHTML = '<i class="fa-solid fa-unlock"></i> GPS Matched: Complete Verification';
        verifyBtn.disabled = false;
        
        if(farm.type === 'audit') {
          cameraInt.classList.remove('hidden');
          currentTimeEl.textContent = new Date().toLocaleTimeString();
        } else {
          cameraInt.classList.add('hidden');
        }
      }, 800);
    });
  });
  
  verifyBtn.addEventListener('click', () => {
    if(!verifyBtn.disabled) {
      verifyBtn.classList.remove('unlocked');
      verifyBtn.classList.add('locked');
      verifyBtn.innerHTML = '<i class="fa-solid fa-check-double"></i> Verified & Logged';
      setTimeout(() => {
        verifyBtn.innerHTML = '<i class="fa-solid fa-lock"></i> Complete Verification (Locked)';
        verifyBtn.disabled = true;
        cameraInt.classList.add('hidden');
      }, 2000);
    }
  });

  // --- Module 5: Krishi Samvaad ---
  const voiceBtn = document.getElementById('voice-report-btn');
  const voiceStatus = document.getElementById('voice-status');
  const pdfBtn = document.getElementById('generate-pdf-btn');

  voiceBtn.addEventListener('click', () => {
    voiceBtn.classList.add('hidden');
    voiceStatus.classList.remove('hidden');
    setTimeout(() => {
      voiceStatus.innerHTML = '<i class="fa-solid fa-check-circle" style="color:#2D6A4F;"></i> Transcribed successfully';
      setTimeout(() => {
        voiceStatus.classList.add('hidden');
        pdfBtn.classList.remove('hidden');
      }, 1000);
    }, 3000);
  });

  // --- Module 6: Friction Logger ---
  const modal = document.getElementById('friction-modal');
  const closeBtn = document.getElementById('close-modal');
  const submitFriction = document.getElementById('submit-friction');
  const tags = document.querySelectorAll('.friction-tag');
  
  document.querySelectorAll('.log-friction-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const farmerName = e.target.closest('.farmer-card').querySelector('h4').textContent;
      document.getElementById('friction-farmer-name').textContent = farmerName;
      modal.classList.add('active');
    });
  });

  closeBtn.addEventListener('click', () => modal.classList.remove('active'));
  
  tags.forEach(tag => {
    tag.addEventListener('click', () => {
      tag.classList.toggle('selected');
    });
  });

  submitFriction.addEventListener('click', () => {
    submitFriction.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Logging...';
    setTimeout(() => {
      submitFriction.innerHTML = 'Submit Friction Log';
      modal.classList.remove('active');
      tags.forEach(t => t.classList.remove('selected'));
      // Could trigger a chart update here to show it's "real-time"
    }, 800);
  });

  // Chart.js Init
  const ctx = document.getElementById('frictionChart').getContext('2d');
  new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Margin Money', 'Missing 7/12', 'No Bank A/C', 'Land Dispute'],
      datasets: [{
        data: [70, 15, 10, 5],
        backgroundColor: ['#C1121F', '#FFB703', '#2D6A4F', '#111827'],
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'right', labels: { boxWidth: 12, font: { family: 'Outfit' } } }
      }
    }
  });

});
