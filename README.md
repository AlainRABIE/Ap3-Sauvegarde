Pour lancer l'application vous pouvez clonée mon projet avec cette url :

Ensuite crée un fichier .env.local et mettre ceci à l'interieur :

NEXT_PUBLIC_SUPABASE_URL=https://yoounvoicycbdpqdwyxa.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlvb3Vudm9pY3ljYmRwcWR3eXhhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQwMTg4NzAsImV4cCI6MjA0OTU5NDg3MH0.2_EGFXaReYh0qCqVx17KB-dzuaEx_BT9YcykIUhvEls


# Connect to Supabase via connection pooling with Supavisor.
DATABASE_URL="postgresql://postgres.yoounvoicycbdpqdwyxa:bej2r4t43CiWeFLB@aws-0-eu-west-3.pooler.supabase.com:6543/postgres?pgbouncer=true"


# Direct connection to the database. Used for migrations.
DIRECT_URL="postgresql://postgres.yoounvoicycbdpqdwyxa:bej2r4t43CiWeFLB@aws-0-eu-west-3.pooler.supabase.com:5432/postgres"

Puis executer la commmande cd pour entrée dans le projet puis faire npm install
