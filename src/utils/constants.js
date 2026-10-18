// Ye stages .NET ke Helpers/OrderStages.cs jaise hi hone chahiye
export const STAGES = {
  Normal: ['Naya order', 'Tayyari mein', 'Tayyar hai', 'Rawana', 'Delivered'],
  Uniform: ['Naya order', 'Cutting', 'Silai', 'Finishing', 'Tayyar hai', 'Delivered'],
}
export const PAYMENTS = ['Cash', 'Card', 'Easypaisa / JazzCash', 'Udhaar']
export const UNIFORM_ITEMS = { Shirt: 'upper', Froke: 'upper', Pant: 'lower', Shalwar: 'lower', Trouser: 'lower', Other: null }
export const SHOP = { name: 'Pakistan Uniform & Book Center ', phone: '0336-8170336', address: 'ORANGI NO 5' }
export const EXPENSE_TITLES = ['Bills',  'Salary', 'Transport', 'Karigar ujrat', 'Chai / khana']
export const MEASURES = {
  upper: [['length', 'Length'], ['shoulder', 'Shoulder'], ['sleeve', 'Sleeve length'], ['chest', 'Chest'], ['neck', 'Neck'], ['pet', 'Pet (tummy)']],
  lower: [['length', 'Length'], ['waist', 'Waist'], ['hip', 'Hip'], ['thigh', 'Thigh'], ['fly', 'Fly'], ['bottom', 'Bottom']],
}
export const GENDERS = [['Boy', 'Boy (Ladka)'], ['Girl', 'Girl (Ladki)']]
export const PIECE_ITEMS = ['Shirt', 'Pant', 'Kameez', 'Shalwar', 'Waistcoat', 'Coat', 'Other']