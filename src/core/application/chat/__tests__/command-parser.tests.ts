import { CommandParser } from '../command-parser';

describe('CommandParser', () => {
  let parser: CommandParser;

  beforeEach(() => {
    parser = new CommandParser();
  });

  const cases: Array<{
    input: string;
    expected: any;
    description?: string;
  }> = [
    {
      input: 'Add milk, eggs, butter',
      expected: {
        action: 'add',
        items: ['milk', 'eggs', 'butter'],
        status: 'Ok',
      },
    },
    {
      input: 'Update milk to low',
      expected: { action: 'update', items: ['milk'], status: 'Low' },
    },
    {
      input: 'Set bread to out',
      expected: { action: 'update', items: ['bread'], status: 'Out' },
    },
    {
      input: 'Remove milk, eggs',
      expected: { action: 'remove', items: ['milk', 'eggs'] },
    },
    {
      input: 'Got milk, eggs, butter',
      expected: {
        action: 'update',
        items: ['milk', 'eggs', 'butter'],
        status: 'Ok',
      },
    },
    {
      input: 'Need milk, eggs',
      expected: { action: 'update', items: ['milk', 'eggs'], status: 'Low' },
    },
    {
      input: 'Low on bread',
      expected: { action: 'update', items: ['bread'], status: 'Low' },
    },
    {
      input: 'Out of coffee',
      expected: { action: 'update', items: ['coffee'], status: 'Out' },
    },
    {
      input: 'Show low items',
      expected: { action: 'filter', items: [], status: 'Low' },
    },
    {
      input: 'List out items',
      expected: { action: 'filter', items: [], status: 'Out' },
    },
    {
      input: 'Show items',
      expected: { action: 'list', items: [] },
    },
    {
      input: 'milk, eggs, cheese',
      expected: {
        action: 'add',
        items: ['milk', 'eggs', 'cheese'],
        status: 'Ok',
      },
    },
    {
      input: '',
      expected: null,
    },
    {
      input: '   ',
      expected: null,
    },
  ];

  cases.forEach(({ input, expected }, idx) => {
    it(`parses case #${idx + 1}: "${input}"`, () => {
      expect(parser.parse(input)).toEqual(expected);
    });
  });
});
