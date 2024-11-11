"use client";
import { useState } from 'react';
import axios from 'axios';
import bcrypt from 'bcryptjs';
import styles from '../styles/Page.module.css';
import DOMPurify from 'dompurify';

interface User {
  username: string;
  password: string;
}

const ProjectPage: React.FC = () => {
    const [isXSSAttackEnabled, setXSSAttackEnabled] = useState(false);
    const [userInput, setUserInput] = useState('');
    const [storedData, setStoredData] = useState<JSX.Element | null>(null);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [userData, setUserData] = useState<User[]>([]);
    const [isSensitiveDataExposureEnabled, setSensitiveDataExposureEnabled] = useState(false);

    const inputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const input = event.target.value;
      console.log("User input:", input);
      setUserInput(input);
  };

  const storeUserData = async () => {
    let passwordToStore = password;

    if (!isSensitiveDataExposureEnabled) {
        const salt = bcrypt.genSaltSync(10);
        passwordToStore = bcrypt.hashSync(password, salt);
    }

    try {
        // Store the user data via an API call (adjust API endpoint as needed)
        await axios.post('http://localhost:3001/storeUser', { username, password: passwordToStore });
        alert("Data stored successfully!");
    } catch (error) {
        console.error("Failed to store data", error);
    }
};

  const fetchUserData = async () => {
    try {
        const response = await axios.get('http://localhost:3001/getUserData');
        setUserData(response.data);
    } catch (error) {
        console.error("Failed to fetch data", error);
    }
  };  
  
  const storeData = () => {
    const outputDiv = document.getElementById('xssOutput');

    if (isXSSAttackEnabled && outputDiv) {
        outputDiv.innerHTML = userInput;

        const scripts = outputDiv.querySelectorAll('script');
        scripts.forEach((oldScript) => {
            const newScript = document.createElement('script');
            
            [...oldScript.attributes].forEach(attr => {
                newScript.setAttribute(attr.name, attr.value);
            });
            
            newScript.textContent = oldScript.textContent;
            oldScript.parentNode?.replaceChild(newScript, oldScript);
        });

        outputDiv.innerHTML = '';
    }
    else {
        const sanitizedInput = DOMPurify.sanitize(userInput);
        setStoredData(
            <div 
                dangerouslySetInnerHTML={{ __html: sanitizedInput }} 
            />
        );
    }
};

    return (
        <div className={styles.projectContainer}>
            <h1 className={styles.title}>Drugi projekt</h1>

            <section className={styles.section}>
                <h2 className={styles.sectionTitle}>Cross-site scripting (XSS)</h2>
                <p className={styles.instructions}>
                    Primjer Cross-site scripting (XSS). Sa checkboxom se uključi ili isključi opcija hoće li aplikacija biti ranjiva takvoj vrsti napada. Ako je checkbox isključen provodi se čišćenje upisanog teksta od potencijalnog JavaScrpit koda, a ako je uključen aplikacija je nesigurna i to se može testirati ubacivanjem nekog koda kao što je na primjer: &lt;script&gt;alert('XSS test');&lt;/script&gt;
                </p>
                <label>
                    <input
                        type="checkbox"
                        checked={isXSSAttackEnabled}
                        onChange={() => setXSSAttackEnabled(!isXSSAttackEnabled)}
                    />
                    Ranjivost uključena
                </label>
                <div className={styles.inputGroup}>
                    <label className={styles.label}>Poruka: 
                      <input type="text" className={styles.textInput} value={userInput} onChange={inputChange} placeholder="Upiši poruku"/>
                    </label>
                </div>
                <button className={styles.button} onClick={storeData}>Spremi podatke</button>
                <div id="xssOutput">
                  {!isXSSAttackEnabled && storedData}
                </div>
            </section>

            <section className={styles.section}>
                <h2 className={styles.sectionTitle}>Nesigurna pohrana osjetljivih podataka (Sensitive Data Exposure)</h2>
                <p className={styles.instructions}>
                    Primjer nesigurne pohrane osjetljivih podataka. Sa checkboxom se uključi ili isključi opcija hoće li aplikacija sigurno spremati podatake kao što je lozinka. 
                    Unesti korisničko ime i lozinku te kliknuti gumb "Spremi podatke", ako je checkbox isključen pohranit će se kriptirana lozinka, a ako je uključen pohranti će se lozinka kao običan tekst.
                    Dohvat podataka sa gumbom "Prikaži osjetljve podatke".
                </p>
                <label>
                    <input
                        type="checkbox"
                        checked={isSensitiveDataExposureEnabled}
                        onChange={() => setSensitiveDataExposureEnabled(!isSensitiveDataExposureEnabled)}
                    />
                    Ranjivost uključena
                </label>

                <div className={styles.inputGroup}>
                    <label className={styles.label}>Korisničko ime: 
                        <input type="text" className={styles.textInput} value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Korisničko ime"/>
                    </label>
                </div>
                <div className={styles.inputGroup}>
                    <label className={styles.label}>Lozinka: 
                        <input type="password" className={styles.textInput} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Lozinka"/>
                    </label>
                </div>
                <button className={styles.button} onClick={storeUserData}>Spremi podatke</button>
                <br />
                <br />
                <button className={styles.button} onClick={fetchUserData}>Prikaži osjetljve podatke</button>

                <div>
                    {userData.length > 0 && (
                        <ul>
                            {userData.map((user, index) => (
                                <li key={index}>{`Korisničko ime: ${user.username}, Lozinka: ${user.password}`}</li>
                            ))}
                        </ul>
                    )}
                </div>
            </section>
        </div>
    );
};

export default ProjectPage;