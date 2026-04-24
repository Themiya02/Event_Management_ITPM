const fs = require('fs');
const filePath = 'c:\\Users\\kumut\\Desktop\\itpm new\\Event_Management_ITPM\\frontend\\src\\App.jsx';
const content = fs.readFileSync(filePath, 'utf8');
const lines = content.split(/\r?\n/);

const newLines = lines.slice(0, 434);
newLines.push(
`          <Route
            path="/food/dashboard"
            element={
              <PrivateRoute>
                <FoodDashboard />
              </PrivateRoute>
            }
          />

          <Route
            path="/admin/events-handling"
            element={
              <PrivateRoute allowedRoles={['admin']}>
                <AdminEventsHandling />
              </PrivateRoute>
            }
          />`
);
newLines.push(...lines.slice(440));

fs.writeFileSync(filePath, newLines.join('\n'));
