export class DateHelper {
  /**
   * Get current date in specified format
   */
  static getCurrentDate(format: 'ISO' | 'US' | 'UK' | 'DB' = 'ISO'): string {
    const now = new Date();

    switch (format) {
      case 'ISO':
        return now.toISOString().split('T')[0]; // YYYY-MM-DD
      case 'US':
        return now.toLocaleDateString('en-US'); // M/D/YYYY
      case 'UK':
        return now.toLocaleDateString('en-GB'); // DD/MM/YYYY
      case 'DB':
        return now.toISOString().replace('T', ' ').replace('Z', ''); // YYYY-MM-DD HH:mm:ss.sss
      default:
        return now.toISOString().split('T')[0];
    }
  }

  /**
   * Get current timestamp
   */
  static getCurrentTimestamp(): number {
    return Date.now();
  }

  /**
   * Get current date time string for filenames
   */
  static getTimestampForFilename(): string {
    const now = new Date();
    return now
      .toISOString()
      .replace(/:/g, '-')
      .replace(/\./g, '-')
      .replace('T', '_')
      .replace('Z', '');
  }

  /**
   * Add days to current date
   */
  static addDays(days: number, format: 'ISO' | 'US' | 'UK' | 'DB' = 'ISO'): string {
    const date = new Date();
    date.setDate(date.getDate() + days);

    switch (format) {
      case 'ISO':
        return date.toISOString().split('T')[0];
      case 'US':
        return date.toLocaleDateString('en-US');
      case 'UK':
        return date.toLocaleDateString('en-GB');
      case 'DB':
        return date.toISOString().replace('T', ' ').replace('Z', '');
      default:
        return date.toISOString().split('T')[0];
    }
  }

  /**
   * Subtract days from current date
   */
  static subtractDays(days: number, format: 'ISO' | 'US' | 'UK' | 'DB' = 'ISO'): string {
    return this.addDays(-days, format);
  }

  /**
   * Add months to current date
   */
  static addMonths(months: number, format: 'ISO' | 'US' | 'UK' | 'DB' = 'ISO'): string {
    const date = new Date();
    date.setMonth(date.getMonth() + months);

    switch (format) {
      case 'ISO':
        return date.toISOString().split('T')[0];
      case 'US':
        return date.toLocaleDateString('en-US');
      case 'UK':
        return date.toLocaleDateString('en-GB');
      case 'DB':
        return date.toISOString().replace('T', ' ').replace('Z', '');
      default:
        return date.toISOString().split('T')[0];
    }
  }

  /**
   * Add years to current date
   */
  static addYears(years: number, format: 'ISO' | 'US' | 'UK' | 'DB' = 'ISO'): string {
    const date = new Date();
    date.setFullYear(date.getFullYear() + years);

    switch (format) {
      case 'ISO':
        return date.toISOString().split('T')[0];
      case 'US':
        return date.toLocaleDateString('en-US');
      case 'UK':
        return date.toLocaleDateString('en-GB');
      case 'DB':
        return date.toISOString().replace('T', ' ').replace('Z', '');
      default:
        return date.toISOString().split('T')[0];
    }
  }

  /**
   * Get first day of current month
   */
  static getFirstDayOfMonth(format: 'ISO' | 'US' | 'UK' | 'DB' = 'ISO'): string {
    const date = new Date();
    date.setDate(1);

    switch (format) {
      case 'ISO':
        return date.toISOString().split('T')[0];
      case 'US':
        return date.toLocaleDateString('en-US');
      case 'UK':
        return date.toLocaleDateString('en-GB');
      case 'DB':
        return date.toISOString().replace('T', ' ').replace('Z', '');
      default:
        return date.toISOString().split('T')[0];
    }
  }

  /**
   * Get last day of current month
   */
  static getLastDayOfMonth(format: 'ISO' | 'US' | 'UK' | 'DB' = 'ISO'): string {
    const date = new Date();
    date.setMonth(date.getMonth() + 1, 0);

    switch (format) {
      case 'ISO':
        return date.toISOString().split('T')[0];
      case 'US':
        return date.toLocaleDateString('en-US');
      case 'UK':
        return date.toLocaleDateString('en-GB');
      case 'DB':
        return date.toISOString().replace('T', ' ').replace('Z', '');
      default:
        return date.toISOString().split('T')[0];
    }
  }

  /**
   * Parse date string to Date object
   */
  static parseDate(dateString: string): Date {
    return new Date(dateString);
  }

  /**
   * Format date object to string
   */
  static formatDate(date: Date, format: 'ISO' | 'US' | 'UK' | 'DB' = 'ISO'): string {
    switch (format) {
      case 'ISO':
        return date.toISOString().split('T')[0];
      case 'US':
        return date.toLocaleDateString('en-US');
      case 'UK':
        return date.toLocaleDateString('en-GB');
      case 'DB':
        return date.toISOString().replace('T', ' ').replace('Z', '');
      default:
        return date.toISOString().split('T')[0];
    }
  }

  /**
   * Check if date is today
   */
  static isToday(dateString: string): boolean {
    const inputDate = new Date(dateString);
    const today = new Date();

    return inputDate.toDateString() === today.toDateString();
  }

  /**
   * Check if date is in the past
   */
  static isPastDate(dateString: string): boolean {
    const inputDate = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return inputDate < today;
  }

  /**
   * Check if date is in the future
   */
  static isFutureDate(dateString: string): boolean {
    const inputDate = new Date(dateString);
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    return inputDate > today;
  }

  /**
   * Get difference between two dates in days
   */
  static getDaysDifference(date1: string, date2: string): number {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    const diffTime = Math.abs(d2.getTime() - d1.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Get age from birth date
   */
  static getAge(birthDate: string): number {
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }

    return age;
  }

  /**
   * Get random date within range
   */
  static getRandomDate(
    startDate: string,
    endDate: string,
    format: 'ISO' | 'US' | 'UK' | 'DB' = 'ISO'
  ): string {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const randomTime = start.getTime() + Math.random() * (end.getTime() - start.getTime());
    const randomDate = new Date(randomTime);

    return this.formatDate(randomDate, format);
  }

  /**
   * Get week start date (Monday)
   */
  static getWeekStart(format: 'ISO' | 'US' | 'UK' | 'DB' = 'ISO'): string {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    const monday = new Date(today.setDate(diff));

    return this.formatDate(monday, format);
  }

  /**
   * Get week end date (Sunday)
   */
  static getWeekEnd(format: 'ISO' | 'US' | 'UK' | 'DB' = 'ISO'): string {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + 7; // Sunday
    const sunday = new Date(today.setDate(diff));

    return this.formatDate(sunday, format);
  }

  /**
   * Validate date format
   */
  static isValidDate(dateString: string): boolean {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date.getTime());
  }

  /**
   * Get quarter start date
   */
  static getQuarterStart(format: 'ISO' | 'US' | 'UK' | 'DB' = 'ISO'): string {
    const today = new Date();
    const quarter = Math.floor(today.getMonth() / 3);
    const quarterStart = new Date(today.getFullYear(), quarter * 3, 1);

    return this.formatDate(quarterStart, format);
  }

  /**
   * Get quarter end date
   */
  static getQuarterEnd(format: 'ISO' | 'US' | 'UK' | 'DB' = 'ISO'): string {
    const today = new Date();
    const quarter = Math.floor(today.getMonth() / 3);
    const quarterEnd = new Date(today.getFullYear(), (quarter + 1) * 3, 0);

    return this.formatDate(quarterEnd, format);
  }
}
