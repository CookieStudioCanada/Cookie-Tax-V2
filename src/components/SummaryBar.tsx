import { useScenarioStore } from '@/stores/useScenarioStore';
import styles from '@/styles/summary.module.css';

export default function SummaryBar() {
  const { output } = useScenarioStore();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
    }).format(amount);
  };

  return (
    <div className={styles.bar}>
      Net Tax: <span className={styles.amount}>
        {output ? formatCurrency(output.netTax) : '$0.00'}
      </span>
    </div>
  );
} 