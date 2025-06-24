import { useScenarioStore } from '@/stores/useScenarioStore';
import styles from '@/styles/table.module.css';

export default function IncomeTable() {
  const { inputs, setField } = useScenarioStore();

  const handleNumberChange = (field: keyof typeof inputs, value: string) => {
    const numValue = parseFloat(value) || 0;
    setField(field, numValue);
  };

  const handleTextChange = (field: keyof typeof inputs, value: string) => {
    setField(field, value);
  };

  return (
    <table className={styles.table}>
      <thead>
        <tr>
          <th className={`${styles.cell} ${styles.head}`}>Income Type</th>
          <th className={`${styles.cell} ${styles.head}`}>Amount ($)</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td className={styles.cell}>Salary</td>
          <td className={`${styles.cell} ${styles.numeric}`}>
            <input
              type="number"
              className={styles.input}
              value={inputs.salary || ''}
              onBlur={(e) => handleNumberChange('salary', e.target.value)}
              onChange={(e) => handleNumberChange('salary', e.target.value)}
              placeholder="0"
            />
          </td>
        </tr>
        <tr>
          <td className={styles.cell}>Eligible Dividends</td>
          <td className={`${styles.cell} ${styles.numeric}`}>
            <input
              type="number"
              className={styles.input}
              value={inputs.eligibleDiv || ''}
              onBlur={(e) => handleNumberChange('eligibleDiv', e.target.value)}
              onChange={(e) => handleNumberChange('eligibleDiv', e.target.value)}
              placeholder="0"
            />
          </td>
        </tr>
        <tr>
          <td className={styles.cell}>Other Income</td>
          <td className={`${styles.cell} ${styles.numeric}`}>
            <input
              type="number"
              className={styles.input}
              value={inputs.otherIncome || ''}
              onBlur={(e) => handleNumberChange('otherIncome', e.target.value)}
              onChange={(e) => handleNumberChange('otherIncome', e.target.value)}
              placeholder="0"
            />
          </td>
        </tr>
        <tr>
          <td className={styles.cell}>Notes</td>
          <td className={styles.cell}>
            <input
              type="text"
              className={styles.input}
              value={inputs.notes}
              onBlur={(e) => handleTextChange('notes', e.target.value)}
              onChange={(e) => handleTextChange('notes', e.target.value)}
              placeholder="Optional notes"
            />
          </td>
        </tr>
      </tbody>
    </table>
  );
} 