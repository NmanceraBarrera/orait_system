import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';
import '../models/user_model.dart';
import '../providers/auth_provider.dart';
import 'billing_accounts_page.dart';
import 'billing_accounts_review_page.dart';
import 'billing_accounts_supervisor_page.dart';
import 'incapacities_page.dart';

class DashboardPage extends StatelessWidget {
  final UserModel user;
  static final Uri _servicesAccessUri = Uri.parse('https://orait-b92dd.web.app/');

  const DashboardPage({super.key, required this.user});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Dashboard'),
        backgroundColor: Theme.of(context).colorScheme.inversePrimary,
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () async {
              final authProvider =
                  Provider.of<AuthProvider>(context, listen: false);
              await authProvider.signOut();
              if (context.mounted) {
                Navigator.of(context).pushReplacementNamed('/');
              }
            },
            tooltip: 'Cerrar Sesión',
          ),
        ],
      ),
      body: _buildDashboardContent(context),
    );
  }

  Widget _buildDashboardContent(BuildContext context) {
    print('🎯 [DASHBOARD] Rol del usuario: "${user.role}"');
    print('🎯 [DASHBOARD] Comparando con "Rescatista": ${user.role == 'Rescatista'}');
    print('🎯 [DASHBOARD] Comparando con "Supervisor": ${user.role == 'Supervisor'}');
    print('🎯 [DASHBOARD] Comparando con "supervisor" (lowercase): ${user.role.toLowerCase() == 'supervisor'}');
    
    // Normalizar el rol para comparación (case-insensitive)
    final normalizedRole = user.role.trim().toLowerCase();
    
    if (normalizedRole == 'rescatista') {
      print('✅ [DASHBOARD] Mostrando dashboard de Rescatista');
      return _buildRescatistaDashboard(context);
    } else if (normalizedRole == 'supervisor') {
      print('✅ [DASHBOARD] Mostrando dashboard de Supervisor');
      return _buildSupervisorDashboard(context);
    } else {
      print('⚠️ [DASHBOARD] Rol desconocido: "${user.role}", mostrando dashboard de Supervisor por defecto');
      return _buildSupervisorDashboard(context);
    }
  }

  Widget _buildSupervisorDashboard(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(20.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          const SizedBox(height: 20),
          const Text(
            'Panel de Supervisor',
            style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 10),
          Text(
            'Bienvenido, ${user.name ?? user.email}',
            style: const TextStyle(fontSize: 16),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 40),
          Expanded(
            child: GridView.count(
              crossAxisCount: 2,
              crossAxisSpacing: 20,
              mainAxisSpacing: 20,
              children: [
                _buildDashboardCard(
                  context,
                  title: 'Revisar Cuentas de Cobro',
                  icon: Icons.receipt_long,
                  color: Colors.blue,
                  onTap: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => const BillingAccountsReviewPage(),
                      ),
                    );
                  },
                ),
                _buildDashboardCard(
                  context,
                  title: 'Todas las Cuentas de Cobro',
                  icon: Icons.list_alt,
                  color: Colors.purple,
                  onTap: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => const BillingAccountsSupervisorPage(),
                      ),
                    );
                  },
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildRescatistaDashboard(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(20.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          const SizedBox(height: 20),
          const Text(
            'Panel de Rescatista',
            style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 10),
          Text(
            'Bienvenido, ${user.name ?? user.email}',
            style: const TextStyle(fontSize: 16),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 40),
          Expanded(
            child: GridView.count(
              crossAxisCount: 2,
              crossAxisSpacing: 20,
              mainAxisSpacing: 20,
              children: [
                _buildDashboardCard(
                  context,
                  title: 'Cuentas de Cobro',
                  icon: Icons.receipt_long,
                  color: Colors.green,
                  onTap: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => const BillingAccountsPage(),
                      ),
                    );
                  },
                ),
                _buildDashboardCard(
                  context,
                  title: 'Incapacidades',
                  icon: Icons.medical_services,
                  color: Colors.orange,
                  onTap: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => const IncapacitiesPage(),
                      ),
                    );
                  },
                ),
                _buildDashboardCard(
                  context,
                  title: 'Acceder a Servicio',
                  icon: Icons.open_in_new,
                  color: Colors.indigo,
                  onTap: () async {
                    final launched = await launchUrl(
                      _servicesAccessUri,
                      mode: LaunchMode.externalApplication,
                    );
                    if (!launched && context.mounted) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(
                          content: Text(
                            'No fue posible abrir el servicio en este momento.',
                          ),
                        ),
                      );
                    }
                  },
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDashboardCard(
    BuildContext context, {
    required String title,
    required IconData icon,
    required Color color,
    required VoidCallback onTap,
  }) {
    return Card(
      elevation: 4,
      child: InkWell(
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.all(20.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(icon, size: 60, color: color),
              const SizedBox(height: 16),
              Text(
                title,
                textAlign: TextAlign.center,
                style: const TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
