import { DateHelper } from '../helpers/date-helper';

export class DataGenerator {
  /**
   * Generate random string with specified length
   */
  static randomString(length: number = 8, includeNumbers: boolean = true): string {
    const letters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const chars = includeNumbers ? letters + numbers : letters;

    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * Generate random number within range
   */
  static randomNumber(min: number = 1, max: number = 1000): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * Generate random email address
   */
  static randomEmail(domain: string = 'test.com'): string {
    const username = this.randomString(8, true).toLowerCase();
    return `${username}@${domain}`;
  }

  /**
   * Generate random phone number
   */
  static randomPhone(format: 'US' | 'UK' | 'DIGITS' = 'US'): string {
    switch (format) {
      case 'US':
        return `(${this.randomNumber(200, 999)}) ${this.randomNumber(200, 999)}-${this.randomNumber(1000, 9999)}`;
      case 'UK':
        return `+44 ${this.randomNumber(1000, 9999)} ${this.randomNumber(100000, 999999)}`;
      case 'DIGITS':
        return this.randomNumber(1000000000, 9999999999).toString();
      default:
        return `(${this.randomNumber(200, 999)}) ${this.randomNumber(200, 999)}-${this.randomNumber(1000, 9999)}`;
    }
  }

  /**
   * Generate random name
   */
  static randomName(type: 'first' | 'last' | 'full' = 'full'): string {
    const firstNames = [
      'James',
      'Mary',
      'John',
      'Patricia',
      'Robert',
      'Jennifer',
      'Michael',
      'Linda',
      'William',
      'Elizabeth',
      'David',
      'Barbara',
      'Richard',
      'Susan',
      'Joseph',
      'Jessica',
      'Thomas',
      'Sarah',
      'Christopher',
      'Karen',
      'Charles',
      'Nancy',
      'Daniel',
      'Lisa',
      'Matthew',
      'Betty',
      'Anthony',
      'Helen',
      'Mark',
      'Sandra',
      'Donald',
      'Donna',
    ];

    const lastNames = [
      'Smith',
      'Johnson',
      'Williams',
      'Brown',
      'Jones',
      'Garcia',
      'Miller',
      'Davis',
      'Rodriguez',
      'Martinez',
      'Hernandez',
      'Lopez',
      'Gonzalez',
      'Wilson',
      'Anderson',
      'Thomas',
      'Taylor',
      'Moore',
      'Jackson',
      'Martin',
      'Lee',
      'Perez',
      'Thompson',
      'White',
      'Harris',
      'Sanchez',
      'Clark',
      'Ramirez',
      'Lewis',
      'Robinson',
      'Walker',
      'Young',
    ];

    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];

    switch (type) {
      case 'first':
        return firstName;
      case 'last':
        return lastName;
      case 'full':
        return `${firstName} ${lastName}`;
      default:
        return `${firstName} ${lastName}`;
    }
  }

  /**
   * Generate random company name
   */
  static randomCompany(): string {
    const prefixes = [
      'Global',
      'Dynamic',
      'Smart',
      'Advanced',
      'Premier',
      'Elite',
      'Prime',
      'Ultimate',
    ];
    const types = [
      'Solutions',
      'Systems',
      'Tech',
      'Industries',
      'Corp',
      'Group',
      'Enterprises',
      'Services',
    ];

    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const type = types[Math.floor(Math.random() * types.length)];

    return `${prefix} ${type}`;
  }

  /**
   * Generate random address
   */
  static randomAddress(): {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  } {
    const streets = [
      'Main St',
      'First Ave',
      'Second St',
      'Park Ave',
      'Oak St',
      'Elm St',
      'Maple Ave',
      'Washington St',
      'Lincoln Ave',
      'Jefferson St',
      'Madison Ave',
      'Jackson St',
    ];

    const cities = [
      'New York',
      'Los Angeles',
      'Chicago',
      'Houston',
      'Phoenix',
      'Philadelphia',
      'San Antonio',
      'San Diego',
      'Dallas',
      'San Jose',
      'Austin',
      'Jacksonville',
    ];

    const states = ['NY', 'CA', 'IL', 'TX', 'AZ', 'PA', 'FL', 'OH', 'NC', 'MI', 'GA', 'WA'];

    return {
      street: `${this.randomNumber(100, 9999)} ${streets[Math.floor(Math.random() * streets.length)]}`,
      city: cities[Math.floor(Math.random() * cities.length)],
      state: states[Math.floor(Math.random() * states.length)],
      zipCode: this.randomNumber(10000, 99999).toString(),
      country: 'USA',
    };
  }

  /**
   * Generate random URL
   */
  static randomUrl(protocol: 'http' | 'https' = 'https'): string {
    const domains = ['example.com', 'test.com', 'demo.org', 'sample.net', 'mock.io'];
    const domain = domains[Math.floor(Math.random() * domains.length)];
    const path = this.randomString(6, false).toLowerCase();

    return `${protocol}://${domain}/${path}`;
  }

  /**
   * Generate random price
   */
  static randomPrice(min: number = 10, max: number = 1000, decimals: number = 2): string {
    const price = Math.random() * (max - min) + min;
    return price.toFixed(decimals);
  }

  /**
   * Generate random date within range
   */
  static randomDate(
    startDate?: string,
    endDate?: string,
    format: 'ISO' | 'US' | 'UK' | 'DB' = 'ISO'
  ): string {
    const start = startDate ? startDate : DateHelper.subtractDays(365);
    const end = endDate ? endDate : DateHelper.addDays(365);

    return DateHelper.getRandomDate(start, end, format);
  }

  /**
   * Generate random boolean
   */
  static randomBoolean(): boolean {
    return Math.random() < 0.5;
  }

  /**
   * Generate random item from array
   */
  static randomFromArray<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  }

  /**
   * Generate random UUID
   */
  static randomUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  /**
   * Generate random credit card number (for testing only)
   */
  static randomCreditCard(type: 'visa' | 'mastercard' | 'amex' = 'visa'): string {
    switch (type) {
      case 'visa':
        return `4${this.randomNumber(100000000000000, 999999999999999)}`;
      case 'mastercard':
        return `5${this.randomNumber(100000000000000, 999999999999999)}`;
      case 'amex':
        return `3${this.randomNumber(10000000000000, 99999999999999)}`;
      default:
        return `4${this.randomNumber(100000000000000, 999999999999999)}`;
    }
  }

  /**
   * Generate random password
   */
  static randomPassword(length: number = 12, includeSpecialChars: boolean = true): string {
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const special = '!@#$%^&*()_+-=[]{}|;:,.<>?';

    let chars = lowercase + uppercase + numbers;
    if (includeSpecialChars) {
      chars += special;
    }

    let password = '';
    // Ensure at least one character from each type
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];

    if (includeSpecialChars) {
      password += special[Math.floor(Math.random() * special.length)];
    }

    // Fill the rest randomly
    for (let i = password.length; i < length; i++) {
      password += chars[Math.floor(Math.random() * chars.length)];
    }

    // Shuffle the password
    return password
      .split('')
      .sort(() => Math.random() - 0.5)
      .join('');
  }

  /**
   * Generate test user data
   */
  static randomUser(): {
    firstName: string;
    lastName: string;
    fullName: string;
    email: string;
    phone: string;
    company: string;
    address: ReturnType<typeof DataGenerator.randomAddress>;
    username: string;
    password: string;
  } {
    const firstName = this.randomName('first');
    const lastName = this.randomName('last');

    return {
      firstName,
      lastName,
      fullName: `${firstName} ${lastName}`,
      email: this.randomEmail(),
      phone: this.randomPhone(),
      company: this.randomCompany(),
      address: this.randomAddress(),
      username: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${this.randomNumber(10, 99)}`,
      password: this.randomPassword(),
    };
  }

  /**
   * Generate test product data
   */
  static randomProduct(): {
    name: string;
    description: string;
    price: string;
    sku: string;
    category: string;
    inStock: boolean;
    rating: number;
  } {
    const categories = [
      'Electronics',
      'Clothing',
      'Books',
      'Home & Garden',
      'Sports',
      'Beauty',
      'Automotive',
    ];
    const adjectives = [
      'Premium',
      'Deluxe',
      'Professional',
      'Standard',
      'Basic',
      'Advanced',
      'Classic',
    ];
    const products = ['Widget', 'Device', 'Tool', 'Kit', 'Set', 'System', 'Solution'];

    const adjective = this.randomFromArray(adjectives);
    const product = this.randomFromArray(products);

    return {
      name: `${adjective} ${product}`,
      description: `High-quality ${product.toLowerCase()} for professional use`,
      price: this.randomPrice(10, 500),
      sku: `SKU-${this.randomString(8, true).toUpperCase()}`,
      category: this.randomFromArray(categories),
      inStock: this.randomBoolean(),
      rating: Math.round((Math.random() * 4 + 1) * 10) / 10, // 1.0 to 5.0
    };
  }

  /**
   * Generate file name with timestamp
   */
  static randomFileName(extension: string = 'txt', prefix?: string): string {
    const timestamp = DateHelper.getTimestampForFilename();
    const randomPart = this.randomString(6, false).toLowerCase();
    const prefixPart = prefix ? `${prefix}_` : '';

    return `${prefixPart}${randomPart}_${timestamp}.${extension}`;
  }

  /**
   * Generate random color hex code
   */
  static randomColor(): string {
    return (
      '#' +
      Math.floor(Math.random() * 16777215)
        .toString(16)
        .padStart(6, '0')
    );
  }

  /**
   * Generate random coordinates
   */
  static randomCoordinates(): { lat: number; lng: number } {
    return {
      lat: Math.random() * 180 - 90, // -90 to 90
      lng: Math.random() * 360 - 180, // -180 to 180
    };
  }
}
