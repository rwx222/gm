'use client'
import classNames from 'classnames'
import { useCombobox } from 'downshift'
import { isNonEmptyArray } from 'ramda-adjunct'
import { useState, Suspense, useCallback, useEffect } from 'react'

import SearchIcon from '@/icons/SearchIcon'

function BaseComponent({ disabled, dataArr, makeFilterFn, onSelectedUser }) {
  const [items, setItems] = useState(dataArr)

  const stateReducer = useCallback(
    (state, actionAndChanges) => {
      const { changes } = actionAndChanges
      const selectedUserUid = changes?.selectedItem?.uid

      if (selectedUserUid) {
        setTimeout(() => {
          onSelectedUser(selectedUserUid)
        }, 400)

        return {
          ...changes,
          inputValue: '',
          selectedItem: null,
        }
      } else {
        return changes
      }
    },
    [onSelectedUser]
  )

  const itemToString = useCallback((item) => {
    return item?.username ?? ''
  }, [])

  const {
    isOpen,
    getLabelProps,
    getMenuProps,
    getInputProps,
    highlightedIndex,
    getItemProps,
  } = useCombobox({
    items,
    itemToString,
    stateReducer,
    onInputValueChange({ inputValue }) {
      setItems(dataArr.filter(makeFilterFn(inputValue)))
    },
  })

  useEffect(() => {
    setItems(dataArr)
  }, [dataArr])

  return (
    <div>
      <div className='w-full'>
        <label
          className='text-xs xs:text-base min-h-5 sm:min-h-7 font-normal w-full whitespace-nowrap overflow-hidden overflow-ellipsis'
          {...getLabelProps()}
        >
          {`Invite users:`}
        </label>
        <div className='input input-bordered flex items-center gap-2 input-accent text-lg mt-1'>
          <input
            placeholder='Name, username or email'
            className='grow'
            disabled={disabled}
            {...getInputProps()}
          />

          <SearchIcon width='20' height='20' className='opacity-70' />
        </div>
      </div>
      <ul
        className={classNames(
          'absolute w-full mt-1 shadow-md max-h-80 overflow-scroll p-0 z-10 rounded bg-base-300',
          {
            hidden: !isOpen,
          }
        )}
        {...getMenuProps()}
      >
        {isOpen &&
          (isNonEmptyArray(items) ? (
            items.map((item, index) => (
              <li
                className={classNames('py-2 px-3 shadow-sm cursor-pointer', {
                  'bg-base-200': highlightedIndex === index,
                })}
                key={item.uid}
                {...getItemProps({ item, index })}
              >
                <span className='block'>{item.displayName}</span>
                <span className='block text-sm text-accent'>
                  {item.username}
                </span>
              </li>
            ))
          ) : (
            <li className='py-4 px-3 flex items-center justify-center'>
              {`No hay datos`}
            </li>
          ))}
      </ul>
    </div>
  )
}

export default function SearchUsersCombobox(props) {
  return (
    <Suspense>
      <BaseComponent {...props} />
    </Suspense>
  )
}
