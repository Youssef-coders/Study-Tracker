# Dynamic Subject Management System

## Overview
The study tracker now features a completely dynamic subject management system that allows users to create, customize, and manage their own subjects with personalized colors and automatically generated curriculum and resources pages.

## Key Features

### 🎨 **Custom Subject Creation**
- **Add New Subjects**: Users can create unlimited custom subjects
- **Color Customization**: Each subject can have a unique color theme
- **12 Preset Colors**: Quick selection from professionally chosen color palette
- **Custom Color Picker**: Full RGB color selection for perfect personalization
- **Subject Descriptions**: Optional descriptions for better organization

### 📚 **Automatic Page Generation**
- **Curriculum Pages**: Automatically creates curriculum.html for each subject
- **Resources Pages**: Automatically creates resources.html for each subject
- **Dynamic Styling**: Each page uses the subject's custom color theme
- **Contextual Information**: Pages display subject creation date and color info

### 🔧 **Subject Management**
- **Edit Subjects**: Modify name, color, and description after creation
- **Delete Subjects**: Remove subjects with confirmation (includes all data)
- **Visual Cards**: Beautiful subject cards showing name, color, and action buttons
- **Smart Navigation**: Automatic linking to curriculum and resources pages

### 🔗 **System Integration**
- **Analytics Integration**: Subject hours tracking automatically updates
- **Assignment System**: Homework assignments use dynamic subject list
- **Hour Tracking**: Enhanced hour tracker shows all custom subjects with colors
- **Flashcard System**: Flashcard creation uses dynamic subject list

## How It Works

### Subject Creation Process
1. **Navigate to Subjects Page**: Click "Subjects" in the main navigation
2. **Add New Subject**: Click the "+ Add New Subject" button
3. **Enter Details**: 
   - Subject name (required)
   - Choose color from presets or use color picker
   - Add optional description
4. **Save**: Subject is created with automatic page generation

### Automatic Features
When a subject is created, the system automatically:
- Generates a unique subject ID
- Creates curriculum and resources page templates
- Initializes empty data structures for lessons and resources
- Updates all dropdowns and subject lists throughout the app
- Applies the custom color theme to all subject-related elements

### Data Storage
- **Subject Data**: Stored in localStorage as 'userSubjects'
- **Page Templates**: Stored as 'page_{subjectId}_{pageType}'
- **Subject Content**: Stored as 'curriculum_{subjectId}' and 'resources_{subjectId}'
- **Backward Compatibility**: Maintains compatibility with existing data

## Technical Implementation

### Core Components

#### SubjectManager Class
- **Purpose**: Central management of all subject operations
- **Features**: CRUD operations, page generation, data persistence
- **Integration**: Works with all existing systems

#### Dynamic Page Handler
- **Purpose**: Handles navigation to dynamically generated subject pages
- **Features**: URL routing, page content injection, script reinitialization
- **Fallback**: Graceful handling of missing subjects

#### Color System
- **CSS Variables**: Uses `--term-color` and `--term-color-rgb` for theming
- **Dynamic Styling**: Each subject page applies its own color scheme
- **Consistent Design**: Maintains visual consistency across the application

### File Structure
```
study-tracker/
├── subjectManager.js          # Main subject management system
├── dynamic-page-handler.js    # Handles dynamic page navigation
├── subjects.html              # Updated to use dynamic system
├── analytics.html             # Updated for dynamic subjects
├── homework.html              # Updated assignment form
├── flashcards.html            # Updated for dynamic subjects
└── style.css                  # Added dynamic subject styling
```

## User Experience

### Before (Static System)
- Fixed 8 hardcoded subjects
- No customization options
- Static color scheme
- Rigid curriculum structure

### After (Dynamic System)
- Unlimited custom subjects
- Full color personalization
- Automatic page generation
- Flexible and scalable
- User-controlled experience

## Migration Notes

### Existing Users
- **Backward Compatibility**: Existing data is preserved
- **Default Subjects**: First-time users get 3 default subjects (Math, Physics, Chemistry)
- **Gradual Migration**: Users can customize existing subjects or create new ones
- **Data Integrity**: All existing assignments, hours, and analytics data remain intact

### Removed Files
The following hardcoded subject directories have been removed:
- `math/curriculum.html` & `math/resources.html`
- `physics/curriculum.html` & `physics/resources.html`
- `chemistry/curriculum.html` & `chemistry/resources.html`
- `english/curriculum.html` & `english/resources.html`
- `biology/curriculum.html` & `biology/resources.html`
- `arabic/curriculum.html` & `arabic/resources.html`
- `business/curriculum.html` & `business/resources.html`
- `accounting/curriculum.html` & `accounting/resources.html`

## Future Enhancements

### Planned Features
1. **Subject Templates**: Pre-built subject templates for common courses
2. **Color Themes**: Multiple color themes per subject (light/dark variations)
3. **Subject Icons**: Custom icons for each subject
4. **Import/Export**: Subject sharing between users
5. **Subject Analytics**: Detailed analytics per subject
6. **Subject Goals**: Individual goal setting per subject

### Technical Improvements
1. **File System Integration**: Real file generation instead of localStorage
2. **Cloud Synchronization**: Firebase integration for subject sync
3. **Performance Optimization**: Lazy loading of subject pages
4. **SEO Optimization**: Proper URL routing for subject pages

## Benefits

### For Users
- **Complete Control**: Create exactly the subjects they need
- **Visual Consistency**: Personalized color themes throughout the app
- **Scalability**: Add unlimited subjects as needed
- **Organization**: Better organization with custom descriptions

### For Business
- **Flexibility**: Adapts to any educational system or curriculum
- **User Engagement**: Personalization increases user investment
- **Scalability**: System grows with user needs
- **Maintenance**: Easier to maintain than hardcoded subjects

The dynamic subject management system transforms the study tracker from a rigid, predefined tool into a flexible, personalized learning companion that adapts to each user's unique educational journey.
