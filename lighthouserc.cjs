module.exports = {
  ci: {
    collect: {
      staticDistDir: '.lighthouse-dist',
      numberOfRuns: 2,
      url: [
        'http://localhost/',
        'http://localhost/about/',
        'http://localhost/services/',
        'http://localhost/new-patients/',
        'http://localhost/contact/'
      ],
      settings: {
        chromeFlags: '--headless --no-sandbox --disable-dev-shm-usage',
        preset: 'desktop',
        onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo']
      }
    },
    assert: {
      assertions: {
        'categories:seo': ['error', { minScore: 1 }],
        'categories:accessibility': ['error', { minScore: 0.95 }],
        'categories:best-practices': ['error', { minScore: 0.95 }],
        'categories:performance': ['error', { minScore: 0.9 }],
        'document-title': 'error',
        'meta-description': 'error',
        'canonical': 'error',
        'is-crawlable': 'error',
        'crawlable-anchors': 'error',
        'errors-in-console': 'error',
        'html-has-lang': 'error',
        'image-alt': 'error',
        'unsized-images': 'error',
        'uses-responsive-images': ['error', { minScore: 0.9 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 3000 }],
        'total-blocking-time': ['error', { maxNumericValue: 300 }]
      }
    },
    upload: {
      target: 'filesystem',
      outputDir: '.lighthouseci'
    }
  }
};
