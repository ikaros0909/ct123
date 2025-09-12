// Test arrow function syntax
const data = [{날짜: '2024-01-01', 평균AI_H지수: 5}];

// This syntax
const test1 = data.map(d => ({
  label: d.날짜,
  value: d.평균AI_H지수
}));

console.log('Test 1:', test1);

// Alternative syntax
const test2 = data.map((d) => {
  return {
    label: d.날짜,
    value: d.평균AI_H지수
  };
});

console.log('Test 2:', test2);