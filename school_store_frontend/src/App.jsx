import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { Checkbox } from '@/components/ui/checkbox.jsx'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table.jsx'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog.jsx'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog.jsx'
import {
  Star,
  ShoppingCart,
  Trophy,
  Gift,
  Heart,
  Sparkles,
  LogOut,
  Plus,
  Minus,
  User,
  Users,
  BarChart3,
  Settings,
  Search,
  Eye,
  Edit,
  Trash2,
  Package
} from 'lucide-react'
import AddStudentForm from './components/AddStudentForm.jsx'
import './App.css'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)
  const [storeItems, setStoreItems] = useState([])
  const [cart, setCart] = useState([])
  const [currentView, setCurrentView] = useState('login')

  // Award Points state
  const [students, setStudents] = useState([])
  const [selectedStudents, setSelectedStudents] = useState([]) // Changed to array for multiple selection
  const [awardPoints, setAwardPoints] = useState('')
  const [awardReason, setAwardReason] = useState('')
  const [awardLoading, setAwardLoading] = useState(false)
  const [pointsTransactions, setPointsTransactions] = useState([])
  const [selectAll, setSelectAll] = useState(false)

  // Student Management state
  const [allUsers, setAllUsers] = useState([])
  const [isLoadingUsers, setIsLoadingUsers] = useState(false)
  const [studentSearchTerm, setStudentSearchTerm] = useState('')
  const [studentRoleFilter, setStudentRoleFilter] = useState('all')
  const [studentSortField, setStudentSortField] = useState('first_name')
  const [studentSortDirection, setStudentSortDirection] = useState('asc')
  const [showAddStudentDialog, setShowAddStudentDialog] = useState(false)
  const [showEditStudentDialog, setShowEditStudentDialog] = useState(false)
  const [showStudentProfileDialog, setShowStudentProfileDialog] = useState(false)
  const [selectedStudentForManagement, setSelectedStudentForManagement] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editStudentForm, setEditStudentForm] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    role: 'student'
  })

  // Store management state
  const [storeItemsLoading, setStoreItemsLoading] = useState(false)
  const [storeItemSearch, setStoreItemSearch] = useState('')
  const [storeItemCategoryFilter, setStoreItemCategoryFilter] = useState('all')
  const [showAddItemDialog, setShowAddItemDialog] = useState(false)
  const [editingStoreItem, setEditingStoreItem] = useState(null)
  const [storeItemFormLoading, setStoreItemFormLoading] = useState(false)
  const [storeItemForm, setStoreItemForm] = useState({
    name: '',
    description: '',
    category: '',
    available_sizes: [],
    image: null
  })
  const [showDeleteItemDialog, setShowDeleteItemDialog] = useState(false)
  const [deleteItemId, setDeleteItemId] = useState(null)
  const [deleteItemName, setDeleteItemName] = useState('')

  // Size pricing constants
  const SIZE_PRICING = {
    xsmall: 50,
    small: 100,
    medium: 250,
    large: 500,
    xlarge: 1000
  }

  // Real API authentication
  const login = async (username, password) => {
    setLoading(true)
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ username, password })
      })

      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
        if (data.user.role === 'student') {
          setCurrentView('dashboard')
        } else if (data.user.role === 'teacher') {
          setCurrentView('teacher')
          fetchAllUsers() // Load users for teacher dashboard
        }
      } else {
        const errorData = await response.json()
        alert(errorData.error || 'Invalid credentials!')
      }
    } catch (error) {
      console.error('Login error:', error)
      alert('Login failed. Please check if the backend server is running.')
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      await fetch('http://localhost:5000/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      })
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setUser(null)
      setCurrentView('login')
      setCart([])
    }
  }

  // Handle student selection for award points
  const handleStudentToggle = (studentId) => {
    setSelectedStudents(prev => {
      const newSelection = prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]

      // Update select all state
      const allStudentIds = allUsers.filter(user => user.role === 'student').map(s => s.id)
      setSelectAll(newSelection.length === allStudentIds.length && allStudentIds.length > 0)

      return newSelection
    })
  }

  const handleSelectAllStudents = () => {
    const allStudentIds = allUsers.filter(user => user.role === 'student').map(s => s.id)

    if (selectAll) {
      // Deselect all
      setSelectedStudents([])
      setSelectAll(false)
    } else {
      // Select all
      setSelectedStudents(allStudentIds)
      setSelectAll(true)
    }
  }

  // Award Points API functions
  const fetchStudents = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/users', {
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
        setStudents(data.filter(u => u.role === 'student'))
      }
    } catch (error) {
      console.error('Error fetching students:', error)
    }
  }

  const fetchPointsTransactions = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/points/transactions', {
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
        setPointsTransactions(data)
      }
    } catch (error) {
      console.error('Error fetching points transactions:', error)
    }
  }

  const handleAwardPoints = async () => {
    if (selectedStudents.length === 0 || !awardPoints || !awardReason) {
      alert('Please select students and fill in all fields')
      return
    }

    if (parseInt(awardPoints) <= 0) {
      alert('Points must be a positive number')
      return
    }

    setAwardLoading(true)
    try {
      let successCount = 0
      let failCount = 0

      // Award points to each selected student
      for (const studentId of selectedStudents) {
        try {
          const response = await fetch('http://localhost:5000/api/points/award', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
              student_id: parseInt(studentId),
              points: parseInt(awardPoints),
              reason: awardReason
            }),
          })

          if (response.ok) {
            successCount++
          } else {
            failCount++
            console.error(`Failed to award points to student ${studentId}`)
          }
        } catch (error) {
          failCount++
          console.error(`Error awarding points to student ${studentId}:`, error)
        }
      }

      // Show success/failure summary
      if (successCount > 0 && failCount === 0) {
        alert(`Successfully awarded ${awardPoints} points to ${successCount} student${successCount !== 1 ? 's' : ''}!`)
      } else if (successCount > 0 && failCount > 0) {
        alert(`Awarded points to ${successCount} student${successCount !== 1 ? 's' : ''}, but failed for ${failCount} student${failCount !== 1 ? 's' : ''}.`)
      } else {
        alert(`Failed to award points to any students. Please try again.`)
      }

      // Reset form on success
      if (successCount > 0) {
        setSelectedStudents([])
        setSelectAll(false)
        setAwardPoints('')
        setAwardReason('')
        await fetchPointsTransactions()
      }
    } catch (error) {
      alert('Error awarding points')
    } finally {
      setAwardLoading(false)
    }
  }

  const handlePresetPoints = (points) => {
    setAwardPoints(points.toString())
  }

  // Student Management Functions
  const fetchAllUsers = async () => {
    setIsLoadingUsers(true)
    try {
      const response = await fetch('http://localhost:5000/api/users', {
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
        setAllUsers(data)
      } else {
        alert('Failed to fetch users')
      }
    } catch (error) {
      console.error('Error fetching users:', error)
      alert('Error fetching users')
    } finally {
      setIsLoadingUsers(false)
    }
  }

  const handleAddStudent = async (formData) => {
    setIsSubmitting(true)

    try {
      const response = await fetch('http://localhost:5000/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        alert('Student created successfully!')
        setShowAddStudentDialog(false)
        fetchAllUsers()
        return true // Success
      } else {
        const errorData = await response.json()
        alert(errorData.message || 'Failed to create student')
        return false // Failure
      }
    } catch (error) {
      console.error('Error creating student:', error)
      alert('Error creating student')
      return false // Failure
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditStudent = async (e) => {
    e.preventDefault()
    if (!selectedStudentForManagement) return

    setIsSubmitting(true)

    try {
      const response = await fetch(`http://localhost:5000/api/users/${selectedStudentForManagement.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(editStudentForm)
      })

      if (response.ok) {
        alert('Student updated successfully!')
        setShowEditStudentDialog(false)
        setSelectedStudentForManagement(null)
        fetchAllUsers()
      } else {
        const errorData = await response.json()
        alert(errorData.message || 'Failed to update student')
      }
    } catch (error) {
      console.error('Error updating student:', error)
      alert('Error updating student')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteStudent = async (studentId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/users/${studentId}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      if (response.ok) {
        alert('Student deleted successfully!')
        fetchAllUsers()
      } else {
        const errorData = await response.json()
        alert(errorData.message || 'Failed to delete student')
      }
    } catch (error) {
      console.error('Error deleting student:', error)
      alert('Error deleting student')
    }
  }

  const handleStudentSort = (field) => {
    if (studentSortField === field) {
      setStudentSortDirection(studentSortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setStudentSortField(field)
      setStudentSortDirection('asc')
    }
  }

  // Filter and sort students
  const filteredAndSortedStudents = allUsers
    .filter(user => {
      const matchesSearch =
        user.first_name?.toLowerCase().includes(studentSearchTerm.toLowerCase()) ||
        user.last_name?.toLowerCase().includes(studentSearchTerm.toLowerCase()) ||
        user.username?.toLowerCase().includes(studentSearchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(studentSearchTerm.toLowerCase())

      const matchesRole = studentRoleFilter === 'all' || user.role === studentRoleFilter

      return matchesSearch && matchesRole
    })
    .sort((a, b) => {
      let aVal = a[studentSortField] || ''
      let bVal = b[studentSortField] || ''

      if (studentSortField === 'points_balance') {
        aVal = aVal || 0
        bVal = bVal || 0
      }

      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase()
        bVal = bVal.toLowerCase()
      }

      if (studentSortDirection === 'asc') {
        return aVal < bVal ? -1 : aVal > bVal ? 1 : 0
      } else {
        return aVal > bVal ? -1 : aVal < bVal ? 1 : 0
      }
    })

  // Mock store items
  useEffect(() => {
    setStoreItems([
      {
        id: 1,
        name: '🎨 Art Supplies Set',
        description: 'Complete set of colored pencils, markers, and drawing paper',
        price: 50,
        category: 'Art & Crafts',
        image_url: '🎨'
      },
      {
        id: 2,
        name: '📚 Adventure Book',
        description: 'Exciting collection of adventure stories for young readers',
        price: 75,
        category: 'Books',
        image_url: '📚'
      },
      {
        id: 3,
        name: '🎮 Educational Game',
        description: 'Fun learning game that makes math and science exciting',
        price: 100,
        category: 'Games',
        image_url: '🎮'
      },
      {
        id: 4,
        name: '✏️ Premium Pencil Set',
        description: 'Set of high-quality pencils with fun designs',
        price: 25,
        category: 'School Supplies',
        image_url: '✏️'
      },
      {
        id: 5,
        name: '🏆 Achievement Stickers',
        description: 'Pack of colorful achievement and motivation stickers',
        price: 15,
        category: 'Rewards',
        image_url: '🏆'
      },
      {
        id: 6,
        name: '🧩 Puzzle Challenge',
        description: '100-piece puzzle with beautiful artwork',
        price: 60,
        category: 'Games',
        image_url: '🧩'
      }
    ])
  }, [])

  // Fetch data based on user role
  useEffect(() => {
    if (user && user.role === 'teacher') {
      fetchStudents()
      fetchPointsTransactions()
    }
  }, [user])

  const addToCart = (item) => {
    const existingItem = cart.find(cartItem => cartItem.id === item.id)
    if (existingItem) {
      setCart(cart.map(cartItem =>
        cartItem.id === item.id
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem
      ))
    } else {
      setCart([...cart, { ...item, quantity: 1 }])
    }
  }

  const removeFromCart = (itemId) => {
    setCart(cart.filter(item => item.id !== itemId))
  }

  const updateCartQuantity = (itemId, newQuantity) => {
    if (newQuantity === 0) {
      removeFromCart(itemId)
    } else {
      setCart(cart.map(item =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      ))
    }
  }

  const getTotalCost = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0)
  }

  const purchaseItems = () => {
    const totalCost = getTotalCost()
    if (totalCost > user.points_balance) {
      alert('Not enough points! 😢')
      return
    }

    // Simulate purchase
    setUser({ ...user, points_balance: user.points_balance - totalCost })
    setCart([])
    alert('🎉 Purchase successful! Your items will be ready for pickup!')
  }

  // Login Component
  const LoginForm = () => {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')

    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-400 via-purple-500 to-pink-400 p-4">
        <Card className="w-full max-w-md bg-white rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <CardHeader className="text-center">
            <div className="text-6xl mb-4 animate-bounce">🌟</div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
              Awesome School Store!
            </CardTitle>
            <p className="text-lg text-gray-600 mt-2">Welcome back, superstar! 🚀</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="text-lg p-4 rounded-2xl border-2 border-blue-200 focus:border-blue-400"
              />
            </div>
            <div>
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="text-lg p-4 rounded-2xl border-2 border-blue-200 focus:border-blue-400"
              />
            </div>
            <Button
              onClick={() => login(username, password)}
              disabled={loading}
              className="w-full px-6 py-4 rounded-2xl font-bold text-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
            >
              {loading ? '🔄 Logging in...' : '🚀 Let\'s Go!'}
            </Button>
            <div className="text-center text-sm text-gray-500 mt-4">
              <p>Demo accounts:</p>
              <p>Student: alex_s / student123</p>
              <p>Teacher: teacher1 / teacher123</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Student Dashboard
  const StudentDashboard = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-lg border-b-4 border-blue-300">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="text-4xl animate-bounce">🌟</div>
            <div>
              <h1 className="text-2xl font-bold text-blue-600">
                Hi {user.first_name}! 👋
              </h1>
              <p className="text-gray-600">Ready for some awesome shopping?</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-center">
              <div className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">{user.points_balance}</div>
              <div className="text-sm text-gray-600 font-semibold">⭐ Points</div>
            </div>
            <Button onClick={logout} variant="outline" className="px-6 py-3 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105 active:scale-95">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4">
        <Tabs defaultValue="store" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6 bg-white rounded-2xl p-2 shadow-lg">
            <TabsTrigger value="store" className="px-6 py-3 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105 active:scale-95">
              🛍️ Store
            </TabsTrigger>
            <TabsTrigger value="cart" className="px-6 py-3 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105 active:scale-95 relative">
              🛒 Cart
              {cart.length > 0 && (
                <Badge className="absolute -top-2 -right-2 bg-pink-500 text-white">
                  {cart.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="history" className="px-6 py-3 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105 active:scale-95">
              📊 History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="store">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {storeItems.map((item) => (
                <Card key={item.id} className="bg-white rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden">
                  <CardHeader className="text-center pb-2">
                    <div className="text-6xl mb-2 animate-pulse">{item.image_url}</div>
                    <CardTitle className="text-xl font-bold text-gray-800">
                      {item.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <p className="text-gray-600 mb-4 text-sm">{item.description}</p>
                    <div className="flex justify-between items-center mb-4">
                      <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                        {item.category}
                      </Badge>
                      <div className="text-2xl font-bold text-orange-500">
                        {item.price} ⭐
                      </div>
                    </div>
                    <Button
                      onClick={() => addToCart(item)}
                      className="w-full px-6 py-3 rounded-2xl font-bold text-lg bg-gradient-to-r from-green-500 to-blue-500 text-white hover:from-green-600 hover:to-blue-600 transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
                      disabled={item.price > user.points_balance}
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      {item.price > user.points_balance ? 'Need More Points' : 'Add to Cart'}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="cart">
            <Card className="bg-white rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-center">
                  🛒 Your Shopping Cart
                </CardTitle>
              </CardHeader>
              <CardContent>
                {cart.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-6xl mb-4">🛒</div>
                    <p className="text-xl text-gray-600">Your cart is empty!</p>
                    <p className="text-gray-500">Add some awesome items to get started!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cart.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                        <div className="flex items-center space-x-4">
                          <div className="text-3xl">{item.image_url}</div>
                          <div>
                            <h3 className="font-bold">{item.name}</h3>
                            <p className="text-sm text-gray-600">{item.price} ⭐ each</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                            className="w-8 h-8 p-0 rounded-full"
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                          <span className="w-8 text-center font-bold">{item.quantity}</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                            className="w-8 h-8 p-0 rounded-full"
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => removeFromCart(item.id)}
                            className="ml-4"
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    ))}
                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-xl font-bold">Total:</span>
                        <span className="text-2xl font-bold text-orange-500">
                          {getTotalCost()} ⭐
                        </span>
                      </div>
                      <Button
                        onClick={purchaseItems}
                        className="w-full px-6 py-4 rounded-2xl font-bold text-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
                        disabled={getTotalCost() > user.points_balance}
                      >
                        {getTotalCost() > user.points_balance
                          ? `Need ${getTotalCost() - user.points_balance} more points`
                          : '🎉 Purchase Now!'
                        }
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <Card className="bg-white rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-center">
                  📊 Your Awesome History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">🏆</div>
                  <p className="text-xl text-gray-600">Coming Soon!</p>
                  <p className="text-gray-500">Your purchase and points history will appear here.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )

  // Teacher Dashboard
  const TeacherDashboard = () => (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-lg border-b-4 border-green-300">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="text-4xl">👩‍🏫</div>
            <div>
              <h1 className="text-2xl font-bold text-green-600">
                Teacher Dashboard
              </h1>
              <p className="text-gray-600">Welcome, {user.first_name} {user.last_name}!</p>
            </div>
          </div>
          <Button onClick={logout} variant="outline" className="px-6 py-3 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105 active:scale-95">
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4">
        <Tabs defaultValue="students" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6 bg-white rounded-2xl p-2 shadow-lg">
            <TabsTrigger value="students" className="px-6 py-3 rounded-2xl font-bold transition-all duration-300 transform hover:scale-105 active:scale-95">
              <Users className="w-4 h-4 mr-2" />
              Students
            </TabsTrigger>
            <TabsTrigger value="points" className="px-6 py-3 rounded-2xl font-bold transition-all duration-300 transform hover:scale-105 active:scale-95">
              <Star className="w-4 h-4 mr-2" />
              Award Points
            </TabsTrigger>
            <TabsTrigger value="store" className="px-6 py-3 rounded-2xl font-bold transition-all duration-300 transform hover:scale-105 active:scale-95">
              <Gift className="w-4 h-4 mr-2" />
              Manage Store
            </TabsTrigger>
            <TabsTrigger value="reports" className="px-6 py-3 rounded-2xl font-bold transition-all duration-300 transform hover:scale-105 active:scale-95">
              <BarChart3 className="w-4 h-4 mr-2" />
              Reports
            </TabsTrigger>
          </TabsList>

          <TabsContent value="students">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight">Student Management</h2>
                  <p className="text-gray-600">
                    Manage students, view their profiles and points balance.
                  </p>
                </div>
                <Button onClick={() => setShowAddStudentDialog(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Student
                </Button>
              </div>

              <div className="flex items-center space-x-2">
                <Search className="h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search students..."
                  value={studentSearchTerm}
                  onChange={(e) => setStudentSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
                <Select value={studentRoleFilter} onValueChange={setStudentRoleFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="student">Students</SelectItem>
                    <SelectItem value="teacher">Teachers</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {isLoadingUsers ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                </div>
              ) : (
                <Card className="bg-white rounded-3xl shadow-lg">
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="cursor-pointer" onClick={() => handleStudentSort('first_name')}>
                            Name {studentSortField === 'first_name' && (studentSortDirection === 'asc' ? '↑' : '↓')}
                          </TableHead>
                          <TableHead className="cursor-pointer" onClick={() => handleStudentSort('email')}>
                            Email {studentSortField === 'email' && (studentSortDirection === 'asc' ? '↑' : '↓')}
                          </TableHead>
                          <TableHead className="cursor-pointer" onClick={() => handleStudentSort('role')}>
                            Role {studentSortField === 'role' && (studentSortDirection === 'asc' ? '↑' : '↓')}
                          </TableHead>
                          <TableHead className="cursor-pointer" onClick={() => handleStudentSort('points_balance')}>
                            Points {studentSortField === 'points_balance' && (studentSortDirection === 'asc' ? '↑' : '↓')}
                          </TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredAndSortedStudents.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-8">
                              <Users className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                              <p className="text-gray-500">No users found</p>
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredAndSortedStudents.map((student) => (
                            <TableRow key={student.id}>
                              <TableCell className="font-medium">
                                {student.first_name} {student.last_name}
                              </TableCell>
                              <TableCell>{student.email}</TableCell>
                              <TableCell>
                                <Badge variant={student.role === 'teacher' ? 'default' : 'secondary'}>
                                  {student.role}
                                </Badge>
                              </TableCell>
                              <TableCell>{student.points_balance || 0}</TableCell>
                              <TableCell>
                                <div className="flex items-center space-x-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      setSelectedStudentForManagement(student);
                                      setShowStudentProfileDialog(true);
                                    }}
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      setSelectedStudentForManagement(student);
                                      setEditStudentForm({
                                        username: student.username,
                                        email: student.email,
                                        first_name: student.first_name,
                                        last_name: student.last_name,
                                        role: student.role
                                      });
                                      setShowEditStudentDialog(true);
                                    }}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button variant="ghost" size="sm">
                                        <Trash2 className="h-4 w-4 text-red-500" />
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Delete User</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          Are you sure you want to delete {student.first_name} {student.last_name}?
                                          This action cannot be undone.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction
                                          onClick={() => handleDeleteStudent(student.id)}
                                          className="bg-red-600 hover:bg-red-700"
                                        >
                                          Delete
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              )}

              {/* Add Student Form Component */}
              <AddStudentForm
                isOpen={showAddStudentDialog}
                onClose={() => setShowAddStudentDialog(false)}
                onSubmit={handleAddStudent}
                isSubmitting={isSubmitting}
              />

              {/* Edit Student Dialog */}
              <Dialog open={showEditStudentDialog} onOpenChange={setShowEditStudentDialog}>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Edit User</DialogTitle>
                    <DialogDescription>
                      Update user information.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleEditStudent} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="edit_first_name">First Name</Label>
                        <Input
                          id="edit_first_name"
                          value={editStudentForm.first_name}
                          onChange={(e) => handleEditStudentFormChange('first_name', e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edit_last_name">Last Name</Label>
                        <Input
                          id="edit_last_name"
                          value={editStudentForm.last_name}
                          onChange={(e) => handleEditStudentFormChange('last_name', e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit_username">Username</Label>
                      <Input
                        id="edit_username"
                        value={editStudentForm.username}
                        onChange={(e) => handleEditStudentFormChange('username', e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit_email">Email</Label>
                      <Input
                        id="edit_email"
                        type="email"
                        value={editStudentForm.email}
                        onChange={(e) => handleEditStudentFormChange('email', e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="edit_role">Role</Label>
                      <Select value={editStudentForm.role} onValueChange={(value) => handleEditStudentFormChange('role', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="student">Student</SelectItem>
                          <SelectItem value="teacher">Teacher</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setShowEditStudentDialog(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Updating...' : 'Update User'}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>

              {/* Student Profile Dialog */}
              <Dialog open={showStudentProfileDialog} onOpenChange={setShowStudentProfileDialog}>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>User Profile</DialogTitle>
                  </DialogHeader>
                  {selectedStudentForManagement && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium text-gray-500">Name</Label>
                          <p className="text-sm">{selectedStudentForManagement.first_name} {selectedStudentForManagement.last_name}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-500">Username</Label>
                          <p className="text-sm">{selectedStudentForManagement.username}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium text-gray-500">Email</Label>
                          <p className="text-sm">{selectedStudentForManagement.email}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-500">Role</Label>
                          <Badge variant={selectedStudentForManagement.role === 'teacher' ? 'default' : 'secondary'}>
                            {selectedStudentForManagement.role}
                          </Badge>
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Points Balance</Label>
                        <p className="text-2xl font-bold">{selectedStudentForManagement.points_balance || 0}</p>
                      </div>
                    </div>
                  )}
                  <DialogFooter>
                    <Button onClick={() => setShowStudentProfileDialog(false)}>Close</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </TabsContent>

          <TabsContent value="points">
            <div className="space-y-6">
              {/* Award Points Form */}
              <Card className="bg-white rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold">Award Points to Students</CardTitle>
                  <CardDescription>
                    Award points to students for good behavior, achievements, or participation.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>Select Students</Label>
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="select-all"
                            checked={selectAll}
                            onChange={handleSelectAllStudents}
                            className="rounded border-gray-300"
                          />
                          <Label htmlFor="select-all" className="text-sm font-normal">
                            Select All
                          </Label>
                        </div>
                      </div>
                      <div className="max-h-48 overflow-y-auto border rounded-md p-3 space-y-2">
                        {allUsers.filter(user => user.role === 'student').map((student) => (
                          <div key={student.id} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id={`student-${student.id}`}
                              checked={selectedStudents.includes(student.id)}
                              onChange={() => handleStudentToggle(student.id)}
                              className="rounded border-gray-300"
                            />
                            <Label htmlFor={`student-${student.id}`} className="text-sm font-normal flex-1">
                              {student.first_name} {student.last_name} ({student.email}) - {student.points_balance || 0} pts
                            </Label>
                          </div>
                        ))}
                        {allUsers.filter(user => user.role === 'student').length === 0 && (
                          <p className="text-sm text-gray-500 text-center py-4">No students found</p>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">
                        {selectedStudents.length} student{selectedStudents.length !== 1 ? 's' : ''} selected
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="points-input">Points to Award</Label>
                      <div className="flex gap-2">
                        <Input
                          id="points-input"
                          type="number"
                          min="1"
                          value={awardPoints}
                          onChange={(e) => setAwardPoints(e.target.value)}
                          placeholder="Enter points..."
                          className="flex-1"
                        />
                      </div>
                      <div className="flex gap-2 mt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePresetPoints(5)}
                        >
                          +5
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePresetPoints(10)}
                        >
                          +10
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePresetPoints(25)}
                        >
                          +25
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePresetPoints(50)}
                        >
                          +50
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="reason-input">Reason (Required)</Label>
                      <Textarea
                        id="reason-input"
                        value={awardReason}
                        onChange={(e) => setAwardReason(e.target.value)}
                        placeholder="Enter reason for awarding points..."
                        rows={3}
                      />
                    </div>

                    <Button
                      onClick={handleAwardPoints}
                      disabled={awardLoading || selectedStudents.length === 0 || !awardPoints || !awardReason}
                      className="w-full"
                    >
                      {awardLoading
                        ? `Awarding Points to ${selectedStudents.length} student${selectedStudents.length !== 1 ? 's' : ''}...`
                        : `Award Points to ${selectedStudents.length} student${selectedStudents.length !== 1 ? 's' : ''}`
                      }
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Transactions */}
              <Card className="bg-white rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold">Recent Points Transactions</CardTitle>
                  <CardDescription>
                    View the history of points awarded to students.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {pointsTransactions.length > 0 ? (
                    <div className="space-y-4">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Student</TableHead>
                            <TableHead>Points</TableHead>
                            <TableHead>Reason</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {pointsTransactions.slice(0, 10).map((transaction) => (
                            <TableRow key={transaction.id}>
                              <TableCell>
                                {new Date(transaction.created_at).toLocaleDateString()}
                              </TableCell>
                              <TableCell>
                                {transaction.student_name}
                              </TableCell>
                              <TableCell>
                                <Badge variant={transaction.transaction_type === 'earned' ? 'default' : 'secondary'}>
                                  {transaction.transaction_type === 'earned' ? '+' : '-'}{transaction.points}
                                </Badge>
                              </TableCell>
                              <TableCell>{transaction.description}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                      {pointsTransactions.length > 10 && (
                        <p className="text-sm text-gray-500 text-center">
                          Showing 10 most recent transactions
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="text-6xl mb-4">⭐</div>
                      <p className="text-xl text-gray-600">No transactions found</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="store">
            <Card className="bg-white rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <CardHeader>
                <CardTitle className="text-2xl font-bold">Store Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">🏪</div>
                  <p className="text-xl text-gray-600">Store management features coming soon!</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports">
            <Card className="bg-white rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <CardHeader>
                <CardTitle className="text-2xl font-bold">Reports & Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">📊</div>
                  <p className="text-xl text-gray-600">Reporting features coming soon!</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )

  // Main render logic
  if (currentView === 'login') {
    return <LoginForm />
  } else if (user?.role === 'student') {
    return <StudentDashboard />
  } else if (user?.role === 'teacher') {
    return <TeacherDashboard />
  }

  return <LoginForm />
}

export default App
