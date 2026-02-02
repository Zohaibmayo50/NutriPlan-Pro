/**
 * Local test to verify Firebase Admin credentials format
 * Run this locally to check if your credentials work
 */

// Copy your credentials from Firebase Console
const testCredentials = {
  projectId: "YOUR_PROJECT_ID_HERE",
  clientEmail: "YOUR_CLIENT_EMAIL_HERE",
  // Paste your private key EXACTLY as it appears in the JSON file
  privateKey: "-----BEGIN PRIVATE KEY-----\nYOUR_KEY_HERE\n-----END PRIVATE KEY-----\n"
};

console.log('🔍 Testing Firebase Admin credentials...\n');

console.log('1. Project ID:', testCredentials.projectId);
console.log('2. Client Email:', testCredentials.clientEmail);
console.log('3. Private Key format check:');
console.log('   - Starts with:', testCredentials.privateKey.substring(0, 30));
console.log('   - Contains \\n:', testCredentials.privateKey.includes('\\n'));
console.log('   - Key length:', testCredentials.privateKey.length);
console.log('   - First 100 chars:', testCredentials.privateKey.substring(0, 100));

// Check for common issues
const issues = [];

if (!testCredentials.privateKey.startsWith('-----BEGIN PRIVATE KEY-----')) {
  issues.push('❌ Key does not start with "-----BEGIN PRIVATE KEY-----"');
}

if (!testCredentials.privateKey.includes('\\n')) {
  issues.push('❌ Key does not contain literal \\n characters (found actual newlines instead)');
}

if (testCredentials.privateKey.includes('\n') && !testCredentials.privateKey.includes('\\n')) {
  issues.push('❌ Key contains actual newline characters instead of \\n');
}

if (!testCredentials.privateKey.endsWith('\\n')) {
  issues.push('❌ Key does not end with \\n');
}

if (issues.length > 0) {
  console.log('\n⚠️ ISSUES FOUND:');
  issues.forEach(issue => console.log(issue));
} else {
  console.log('\n✅ Key format looks correct!');
}

console.log('\n📋 INSTRUCTIONS:');
console.log('1. Open your Firebase service account JSON file');
console.log('2. Find the "private_key" field');
console.log('3. Copy EVERYTHING between the quotes (including \\n characters)');
console.log('4. Paste into Vercel as FIREBASE_PRIVATE_KEY');
console.log('\nExample of correct format:');
console.log('-----BEGIN PRIVATE KEY-----\\nMIIEvQIBADANBg...\\n-----END PRIVATE KEY-----\\n');
