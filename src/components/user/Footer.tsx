import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="mt-auto bg-gray-50 border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8">

          {/* 간결한 정보 라인 */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 text-xs text-gray-500">

            {/* 회사명 */}
            <div>
              <span className="text-gray-400">회사</span>
              <p className="mt-1 text-gray-600">통계뱅크(주)</p>
            </div>

            {/* 대표자 */}
            <div>
              <span className="text-gray-400">대표</span>
              <p className="mt-1 text-gray-600">이경만</p>
            </div>

            {/* 사업자번호 */}
            <div>
              <span className="text-gray-400">사업자등록번호</span>
              <p className="mt-1 text-gray-600">605-88-02382</p>
            </div>

            {/* 통신판매업 */}
            <div>
              <span className="text-gray-400">통신판매업</span>
              <p className="mt-1 text-gray-600">제 2022-부산부산진-1707 호</p>
            </div>

            {/* 연락처 */}
            <div>
              <span className="text-gray-400">문의</span>
              <p className="mt-1 text-gray-600">010-6578-3388</p>
            </div>

          </div>

          {/* 구분선 */}
          <div className="my-6 border-t border-gray-100"></div>

          {/* 하단 정보 */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-gray-500">

            {/* 주소 및 이메일 */}
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
              <span>부산광역시 부산진구 서전로 8, 3층 DD-14</span>
              <span className="hidden sm:inline text-gray-300">•</span>
              <span>knowledge_vitamin@naver.com</span>
            </div>

            {/* 링크 및 저작권 */}
            <div className="flex items-center gap-4">
              <a
                href="https://www.통계뱅크.com/?mode=policy"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-gray-700 transition-colors"
              >
                이용약관
              </a>
              <span className="text-gray-300">•</span>
              <a
                href="https://www.통계뱅크.com/?mode=privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-gray-700 transition-colors"
              >
                개인정보처리방침
              </a>
              <span className="text-gray-300">•</span>
              <span>© 2025 통계뱅크</span>
            </div>

          </div>

        </div>
      </div>
    </footer>
  );
};

export default Footer;