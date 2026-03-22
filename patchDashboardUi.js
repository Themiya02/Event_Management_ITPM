const fs = require('fs');

// Patch EventsList.css
let eventsListCss = fs.readFileSync('frontend/src/pages/organizer/EventsList.css', 'utf8');
eventsListCss = eventsListCss.replace(/(\/\* Table Container \*\/[\s\S]*?)(?=\/\* Cells styling \*\/)/, `/* Table Container */
.table-container {
    padding: 0.5rem;
    background: transparent;
    border: none;
    box-shadow: none;
    backdrop-filter: none;
}

.events-table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0 0.8rem;
    text-align: left;
}

.events-table td {
    padding: 1.25rem 1.75rem;
    border: none;
    background: rgba(255, 255, 255, 0.65);
    backdrop-filter: blur(12px);
    transition: all 0.3s ease;
}

.events-table th {
    background: transparent;
    color: var(--text-main);
    font-weight: 700;
    font-size: 0.85rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    padding: 0 1.75rem 0.5rem 1.75rem;
    border: none;
}

.events-table tbody tr {
    transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.events-table tbody tr:hover {
    transform: translateY(-3px) scale(1.005);
    box-shadow: 0 15px 35px rgba(147, 51, 234, 0.15);
}

.events-table tbody tr:hover td {
    background: rgba(255, 255, 255, 0.85);
}

.events-table tbody tr td:first-child {
    border-radius: 16px 0 0 16px;
    border-left: 4px solid transparent;
}

.events-table tbody tr:hover td:first-child {
    border-left-color: var(--primary-color);
}

.events-table tbody tr td:last-child {
    border-radius: 0 16px 16px 0;
}

`);
fs.writeFileSync('frontend/src/pages/organizer/EventsList.css', eventsListCss);

// Patch DashboardHome.css
let dashboardHomeCss = fs.readFileSync('frontend/src/pages/organizer/DashboardHome.css', 'utf8');

dashboardHomeCss = dashboardHomeCss.replace(/\.stat-card \{[\s\S]*?border-color: rgba\(147, 51, 234, 0\.4\);\r?\n\}/, `.stat-card {
    padding: 1.8rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    position: relative;
    overflow: hidden;
    transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.4s ease;
    background: linear-gradient(135deg, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.3) 100%);
    border: 1px solid rgba(255,255,255,0.8);
    border-radius: 24px;
}

.stat-card:hover {
    transform: translateY(-8px);
    box-shadow: 0 20px 40px rgba(147, 51, 234, 0.2);
    border-color: #fff;
    background: linear-gradient(135deg, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.4) 100%);
}`);

dashboardHomeCss = dashboardHomeCss.replace(/\.stat-value \{[\s\S]*?color: var\(--text-main\);\r?\n\}/, `.stat-value {
    font-size: 2.8rem;
    font-weight: 800;
    background: var(--primary-gradient);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    line-height: 1.1;
}`);

dashboardHomeCss = dashboardHomeCss.replace(/\.event-item \{[\s\S]*?transition: all var\(--transition-normal\);\r?\n\}/, `.event-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.2rem;
    background: rgba(255, 255, 255, 0.6);
    border: 1px solid rgba(255, 255, 255, 0.8);
    border-radius: 16px;
    box-shadow: var(--shadow-sm);
    transition: all 0.3s ease;
}`);

fs.writeFileSync('frontend/src/pages/organizer/DashboardHome.css', dashboardHomeCss);

console.log('UI Dashboard CSS patched natively');
